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
		'Completed': 'COMPLETED'
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
		'COMPLETED',
		'POST AUDIT'
	];

	const where = {};
	if (date) where.date_created = date;

	const rows = await RegistrationStatus.findAll({
		attributes: [
			[sequelize.fn('TRIM', sequelize.col('status')), 'status'],
			[sequelize.fn('DATE', sequelize.col('date_created')), 'date'],
			[sequelize.fn('COUNT', '*'), 'count']
		],
		where,
		group: ['status', sequelize.fn('DATE', sequelize.col('date_created'))]
	});

	const counts = {};
	rows.forEach(r => {
		const raw = r.get('status');
		const normalized = String(raw).replace(/\s+/g, ' ').trim().replace(/\s,$/, '').replace(/\s+$/, '');
		const label = labelMap[normalized] || normalized.toUpperCase();
		counts[label] = (counts[label] || 0) + Number(r.get('count'));
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
