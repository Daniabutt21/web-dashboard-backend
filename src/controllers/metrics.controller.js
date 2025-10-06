// Controller for metrics endpoints: aggregates registration_statuses into UI metrics
const { sequelize, RegistrationStatus } = require('../models');

async function getDailyMetrics(req, res) {
	const date = req.query.date;
	const labelMap = {
		'Documents Received': 'DOCUMENTS RECEIVED',
		'Received Title': 'RECEIVED TITLE',
		'Send Docs to TTG': 'SEND DOCS TO TTG',
		'On Hold- QA': 'ON HOLD-QA',
		'TTG sent to county': 'TTG SENT TO COUNTY',
		'Successfully Sent to DMV': 'SUCCESSFULLY SENT TO DMV',
		'WS correction requested': 'WS CORRECTION REQUESTED',
		'WS Correction Complete': 'WS CORRECTION COMPLETE',
		'Post Audit': 'POST AUDIT',
	};

	const uiOrder = [
		'DOCUMENTS RECEIVED',
		'RECEIVED TITLE',
		'SEND DOCS TO TTG',
		'ON HOLD-QA',
		'TTG SENT TO COUNTY',
		'SUCCESSFULLY SENT TO DMV',
		'WS CORRECTION REQUESTED',
		'WS CORRECTION COMPLETE',
		'POST AUDIT'
	];

	let rows;
	
	if (date) {
		rows = await sequelize.query(`
			WITH completed_registrations AS (
				SELECT DISTINCT registration_id
				FROM registration_statuses
				WHERE status = 'Completed' 
				  AND DATE(date_created) <= :selectedDate
			),
			latest_status_per_registration AS (
				SELECT 
					rs.registration_id,
					rs.status,
					rs.date_created,
					ROW_NUMBER() OVER (
						PARTITION BY rs.registration_id, DATE(rs.date_created) 
						ORDER BY rs.date_created DESC
					) as rn_date,
					ROW_NUMBER() OVER (
						PARTITION BY rs.registration_id 
						ORDER BY rs.date_created DESC
					) as rn_overall
				FROM registration_statuses rs
				WHERE DATE(rs.date_created) <= :selectedDate
				  AND rs.registration_id NOT IN (SELECT registration_id FROM completed_registrations)
			),
			status_for_date AS (
				SELECT 
					registration_id,
					status,
					date_created,
					ROW_NUMBER() OVER (
						PARTITION BY registration_id 
						ORDER BY 
							CASE WHEN DATE(date_created) = :selectedDate THEN 0 ELSE 1 END,
							date_created DESC
					) as rn
				FROM latest_status_per_registration
				WHERE (DATE(date_created) = :selectedDate AND rn_date = 1) 
				   OR (DATE(date_created) < :selectedDate AND rn_overall = 1)
			)
			SELECT 
				TRIM(status) as status,
				DATE(:selectedDate) as date,
				COUNT(*) as count
			FROM status_for_date
			WHERE rn = 1
			GROUP BY status
		`, {
			replacements: { selectedDate: date },
			type: sequelize.QueryTypes.SELECT
		});
	} else {
		rows = await RegistrationStatus.findAll({
			attributes: [
				[sequelize.fn('TRIM', sequelize.col('status')), 'status'],
				[sequelize.fn('DATE', sequelize.col('date_created')), 'date'],
				[sequelize.fn('COUNT', '*'), 'count']
			],
			group: ['status', sequelize.fn('DATE', sequelize.col('date_created'))]
		});
	}

	const counts = {};
	rows.forEach(r => {
		const raw = r.status || r.get('status');
		const normalized = String(raw).replace(/\s+/g, ' ').trim().replace(/\s,$/, '').replace(/\s+$/, '');
		const label = labelMap[normalized] || normalized.toUpperCase();
		const count = r.count || r.get('count');
		counts[label] = (counts[label] || 0) + Number(count);
	});

	const metrics = uiOrder.map(label => ({
		key: label.toLowerCase().replace(/\s+/g, ''),
		label,
		value: counts[label] || 0,
		highlight: label === 'ON HOLD-QA'
	}));

	res.json({ date: date || new Date().toISOString().slice(0, 10), metrics });
}

module.exports = { getDailyMetrics };
