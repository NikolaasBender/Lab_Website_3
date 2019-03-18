/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.  We'll be using localhost and run our database on our local machine (i.e. can't be access via the Internet)
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab, we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database.  You'll need to set a password USING THE PSQL TERMINAL THIS IS NOT A PASSWORD FOR POSTGRES USER ACCOUNT IN LINUX!
**********************/
const dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'football_db',
	user: 'postgres',
	password: 'testdb'
};

var db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory



/*********************************
 Below we'll add the get & post requests which will handle:
   - Database access
   - Parse parameters from get (URL) and post (data package)
   - Render Views - This will decide where the user will go after the get/post request has been processed

 Web Page Requests:

  Login Page:        Provided For your (can ignore this page)
  Registration Page: Provided For your (can ignore this page)
  Home Page:
  		
  		
  		/player_info - get request (no parameters)
  			This route will handle a single query to the football_players table which will retrieve the id & name for all of the football players.
  			Next it will pass this result to the player_info view (pages/player_info), which will use the ids & names to populate the select tag for a form 
************************************/

// login page 
app.get('/', function(req, res) {
	res.render('pages/login',{
		local_css:"signin.css", 
		my_title:"Login Page"
	});
});

// registration page 
app.get('/register', function(req, res) {
	res.render('pages/register',{
		my_title:"Registration Page"
	});
});

/*Add your other get/post request handlers below here: */
// home page 
app.get('/home', function (req, res) {
	var query = 'select * from favorite_colors;';
	db.any(query)
		.then(function (rows) {
			res.render('pages/home', {
				my_title: "Home Page",
				data: rows,
				color: '',
				color_msg: ''
			})

		})

		.catch(function (err) {
			// display error message in case an error
			request.flash('error', err);
			response.render('pages/home', {
				title: 'Home Page',
				data: '',
				color: '',
				color_msg: ''
			})
		})
});

app.get('/home/pick_color', function (req, res) {
	var color_choice = req.query.color_selection;
	var color_options = 'select * from favorite_colors;';
	var color_message = "select color_msg from favorite_colors where hex_value = '" + color_choice + "';";
	db.task('get-everything', task => {
		return task.batch([
			task.any(color_options),
			task.any(color_message)
		]);
	})
		.then(info => {
			res.render('pages/home', {
				my_title: "Home Page",
				data: info[0],
				color: color_choice,
				color_msg: info[1][0].color_msg
			})
		})
		.catch(error => {
			// display error message in case an error
			request.flash('error', err);
			response.render('pages/home', {
				title: 'Home Page',
				data: '',
				color: '',
				color_msg: ''
			})
		});

});

app.post('/home/pick_color', function (req, res) {
	var color_hex = req.body.color_hex;
	var color_name = req.body.color_name;
	var color_message = req.body.color_message;
	var insert_statement = "INSERT INTO favorite_colors(hex_value, name, color_msg) VALUES('" + color_hex + "','" +
		color_name + "','" + color_message + "') ON CONFLICT DO NOTHING;";

	var color_select = 'select * from favorite_colors;';
	db.task('get-everything', task => {
		return task.batch([
			task.any(insert_statement),
			task.any(color_select)
		]);
	})
		.then(info => {
			res.render('pages/home', {
				my_title: "Home Page",
				data: info[1],
				color: color_hex,
				color_msg: color_message
			})
		})
		.catch(error => {
			// display error message in case an error
			request.flash('error', err);
			response.render('pages/home', {
				title: 'Home Page',
				data: '',
				color: '',
				color_msg: ''
			})
		});
});


// team_stats - get request (no parameters)
	// This route will require no parameters.It will require 3 postgres queries which will:
	// 1. Retrieve all of the football games in the Fall 2018 Season
	// 2. Count the number of winning games in the Fall 2018 Season
	// 3. Count the number of lossing games in the Fall 2018 Season
	// The three query results will then be passed onto the team_stats view(pages / team_stats).
	// The team_stats view will display all fo the football games for the season, show who won each game,
	// 	and show the total number of wins / losses for the season.

app.get('/team_stats', function (req, res) {
	var seasonGames = "SELECT * FROM football_games;";
	//var wins = "COUNT * FROM football_games WHERE home_score > visitor_score AND game_date > '2010 - 01 - 01 00: 00: 00' AND game_date < '2011 - 01 - 01 00: 00: 00';";
	//var loss = "COUNT * FROM football_games WHERE home_score < visitor_score AND game_date > '2010 - 01 - 01 00: 00: 00' AND game_date < '2011 - 01 - 01 00: 00: 00';";
	db.task('get-everything', task => {
		return task.batch([
			task.any(seasonGames)
			// task.any(wins),
			// task.any(loss)
		]);
	})
		.then(data => {
			res.render('pages/team_stats', {
				my_title: "Page Title Here",
				result_1: data[0]
				// result_2: data[1],
				// result_3: data[2]
			})
		})
		.catch(error => {
			// display error message in case an error
			request.flash('error', err);
			res.render('pages/team_stats', {
				my_title: "Page Title Here",
				result_1: ''
				// result_2: '',
				// result_3: ''
			})
		});
});

function loadStatsPage(dat) {
	var table = document.getElementById("stats_table");//Retrieve our table element
	var results = document.getElementById("winloss");//Retrieve our table element
	var row_counter;//Keeps track of our row index
	var cell1_value;
	var cell2_value;
	var win = 0;
	var loss = 0;
	for (row_counter = 2; row_counter < table.rows.length; row_counter++) {//Outer for loop iterates over each row
		cell1_value = table.rows[row_counter].cells[2].innerHTML;//Read in a cells current value
		cell2_value = table.rows[row_counter].cells[3].innerHTML;
		if (parseInt(cell1_value) > parseInt(cell2_value)) {
			win++;
			table.rows[row_counter].cells[4].innerHTML = "Buffs";
		} else {
			loss++;
			table.rows[row_counter].cells[4].innerHTML = table.rows[row_counter].cells[1].innerHTML;
		}
	}
	results.rows[1].cells[0].innerHTML = win;
	results.rows[1].cells[1].innerHTML = loss;
}

app.listen(3000);
console.log('3000 is the magic port');
