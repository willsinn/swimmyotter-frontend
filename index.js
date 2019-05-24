const USERS_URL = "https://swimmy-otter-backend.herokuapp.com/api/v1/users"

console.log("Not loaded yet!")


document.addEventListener('DOMContentLoaded', event => {
  console.log("Yay, we're loaded!")

  const mainContainer = document.querySelector("#main-container")
  fetch(USERS_URL, {method: 'GET'}).then(resp => resp.json())
  .then(obj => {
    console.log(obj)
  })







})
