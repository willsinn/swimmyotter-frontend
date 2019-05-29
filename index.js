const USERS_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/users"
const registeredUsers = [];
const grab = (selectorStr, parent = document) => parent.querySelector(selectorStr)
let currentUser;

document.addEventListener('DOMContentLoaded', event => {
  const gameContainer = grab("#game-container")
  //get all users
  fetch(USERS_URL)
    .then(r => r.json())
    .then(users => {
      registeredUsers.push(...users)
    })

  //login form
  gameContainer.innerHTML += `
    <div style="height:750px; border:1px solid black; width:500px;">
      <form id="#username-form">
        <label for="name">
          Name
        </label>
        <input type="text" name="name" value="">
        <input type="submit" value="PLAY">
      </form>
    </div>
    `


  document.addEventListener("click", event => {
    event.preventDefault();


    if (event.target.value === "PLAY") {
      let playInputName = event.target.previousElementSibling

      currentUser = registeredUsers.find(user => {
        return user.name === playInputName.value
      }) //registeredUsers forEach

      if (!currentUser) {
        fetch("https://swimmy-otter-backend.herokuapp.com/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            name: playInputName.value
          })
        })
          .then(r => r.json()).then(json => currentUser = json)
      }
      document.getElementById("#username-form").reset()
      //Run video game
    } //if user submits the form
  })



  //userHasSignedIn
})
