Flipper
=======

1) http://flipper.aakay.net/

2) Instructions on deploying locally

	## General

	### Supported Browsers
	- Google Chrome
	- Mozilla Firefox
	- Microsoft Edge (minor bugs)
	- Apple Safari
	- Opera

	### Incompatible Browsers
	- Internet Explorer

	### Public Access
	- http://flipper.aakay.net

	### Local Setup
	1. Ensure `mongodb` is running: `sudo mongod`
	2. Install the node modules: `sudo npm install --save --unsafe-perm`
	3. Reset the database: `npm run init`
	4. Start the server: `sudo npm start`
	5. See section on troubleshooting if you run into any errors.

	### Linting (ESLint)
	- `npm run lint`
	- (These aren't supposed to pass right now.)

	### Testing (Mocha)
	- `npm test`
	- (These aren't supposed to pass right now.)

	### Running
	1. Ensure `mongodb` is running: `sudo mongod`
	2. Start the server: `sudo npm start`

	### Resetting
	1. `npm run init`

	### Troubleshooting
	- If you get the `EADDRINUSE` error stating that the port the server is trying to listen on is in use, then change the `port` number in the `config` section of `package.json`.
	- If you get the `EACCESS` error, then make sure you are using `sudo` or are authenticated as root via `sudo su -`.

3) Discussion about MVP features (and what we left out)

	Identification of minimum viable product for first release 
		Our MVP will contain: 
			Registration of users that can act as both Teachers and/or Students of different classes
			Functionality for Teachers
				Create cources and accept Students
				Add minilessons to classes, pages to minilessons and resources and MCQs to pages 
			Functionality for Students
				View lessons for their classes
				Submit answers to MCQs
			Grades as CSV
		Subset of concepts included in MCQ:
			Teacher
			Student
			Minilesson
			Page
			Resource
			MCQ
			Question
			Answer Choice
			Submission
	Issues postponed (e.g. security mitigations, user interface elements)
		GradeBook
		Expanded analytics for teachers 
		Finalizing and refining CSS and UI themes
		CSRF mitigation
		Verifying teachers
		Editing/deleting minilessons, pages or questions 
		Embedded videos 

4) Discussion about how to use MVP
	- Using MVP as a teacher
		- register and login account1
		- create a class, minilesson and page (include a resource)
		- add MCQs to the page 
		- logout
	- Using MVP as a student
		- register and login account2
		- join a class
		- logout
		- login with teacher account1
		- accept pending student from account2
		- logit
		- login with teacher account2
		- submit an answer to the mcq
		- create classes/pages/minilessons in this account (user can be both a teacher and student)
