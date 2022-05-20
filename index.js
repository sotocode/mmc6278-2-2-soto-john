function greet() {
    var name = prompt('What is your name?');
    alert('Hello ' + name);
    var age = prompt('How old are you?');
    age = (parseInt(age));
    var birthday = confirm('Have you had a birthday yet this year?');
    var year = new Date().getFullYear();
    var birthdayYear = year - age;
    var birthdayYearPast = year - (age + 1);
    if (birthday){
        alert('You were born in ' + birthdayYear);
    } else {
        alert('You were born in ' + birthdayYearPast);
    }
}