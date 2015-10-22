var db = require('../../config/database');
var cassandra = require('cassandra-driver');
var async = require('async');

function Notification (from_id, loodle_id) {

	this.id = cassandra.types.Uuid.random();
	this.from_id = from_id;
	this.doodle_id = loodle_id;
	this.is_read = false;

}

Notification.get = function (notification_id, callback) {

	var query = 'SELECT * FROM notifications WHERE id = ?';
	db.execute(query
		, [ notification_id ]
		, { prepare : true }
		, function (err, data) {
			if (err)
				return callback(err);

			return callback(null, data.rows[0]);
		});

};

Notification.getUser = function (user_id, callback) {

	var query = 'SELECT id, email, first_name, last_name FROM users WHERE id = ?';
	db.execute(query
		, [ user_id ]
		, { prepare : true }
		, function (err, data) {
			if (err)
				return callback(err);

			return callback(null, data.rows[0]);
		})

};

Notification.getLoodle = function (loodle_id, callback) {

	var query = 'SELECT * FROM doodles WHERE id = ?';
	db.execute(query
		, [ loodle_id ]
		, { prepare : true }
		, function (err, data) {
			if (err)
				return callback(err);

			return callback(null, data.rows[0]);
		})

};

Notification.prototype.save = function (user_id, callback) {

	var queries = [
		{
			query: 'INSERT INTO notifications (id, from_id, doodle_id, is_read) values (?, ?, ?, ?)',
			params: [ this.id, this.from_id, this.doodle_id, this.is_read ]
		},
		{
			query: 'INSERT INTO notification_by_user (user_id, notification_id) values (?, ?)',
			params: [ user_id, this.id ]
		},
		{
			query: 'INSERT INTO notification_by_doodle (doodle_id, notification_id) values (?, ?)',
			params: [ this.doodle_id, this.id ]
		}
	];

	db.batch(queries
		, { prepare : true }
		, callback);

};

Notification.getUserIdsOfLoodle = function (loodle_id, callback) {

	var query = 'SELECT user_id FROM user_by_doodle WHERE doodle_id = ?';
	db.execute(query
		, [ loodle_id ]
		, { prepare : true }
		, function (err, data) {
			if (err) 
				return callback(err);

			var results = [];
			data.rows.forEach(function (element) {
				results.push(element.user_id);
			});

			return callback(null, results);
		});

};

Notification.getIdsFromUser = function (user_id, callback) {

	var query = 'SELECT notification_id FROM notification_by_user WHERE user_id = ?';
	db.execute(query
		, [ user_id ]
		, { prepare : true }
		, function (err, data) {
			if (err)
				return callback(err);

			var results = [];
			data.rows.forEach(function (element) {
				results.push(element.notification_id);
			});

			return callback(null, results);
		})

};

Notification.markAsRead = function (notification_id, callback) {

	var query = 'UPDATE notifications SET is_read = true WHERE id = ?';
	db.execute(query
		, [ notification_id ]
		, { prepare : true }
		, callback);

};

module.exports = Notification;