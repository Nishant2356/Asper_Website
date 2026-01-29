We need to create a projects page where members can come and submit their assigned projects so in this page:-

when user enters in the page in the upper side their will be user instructions related to how they can submit here and project details.

then there will be a button named submit project where if clicked a form modal will open and user can give all their details here and click the submit button to successfully submit the project.

the form will be having these fields:-
Name,

Department(drop down of all the asper departments),

github(link of the project optional for tech projects only),

live link(optional),

images(list of images if project is image submission related it will be saved on cloudinary optional),

doubts(user can ask doubts optional),

i have already setup all the cloudinary urls and database urls in the terminal.

it will be having a project table with these fields:-

Name,
Department(enum of all departments)
github link,
live link,
list of image links(cloudinary links),
checked(boolen will tell if the project is checked by admin or not initially false)

when user will submit database will create an entry.