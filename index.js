
import { Octokit } from "https://esm.sh/@octokit/core";
import { token } from "./token.js"

const octokit = new Octokit({
    auth: token
})

let next = ""
let prev = ""
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');

    if (searchInput) {
        // Event listener for the "Enter" key
        searchInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchButton) {
        // Event listener for the search button (optional)
        searchButton.addEventListener('click', performSearch);
    }

    // Function to perform the search
    function performSearch() {
        // const searchTerm = searchInput.value;
        const username = $('#user-name').val()
        // Add your search logic here, e.g., make an API call, update the UI, etc.
       
        getUserAndRepositories(username)
    }
});



$('#previous').on('click',async function(){
   
    const response = await fetchUri(prev)
    updatePrevNext(response.headers.link)
    renderRepositoriesInUi(response.data)
})
$('#next').on('click',async function(){
 
    const response = await fetchUri(next)
    updatePrevNext(response.headers.link)
    renderRepositoriesInUi(response.data)
    
})
const renderRepositoriesInUi = (repos) => {
    const reposDiv = repos.map(repo => (
      `<div class="col-md-6">
          <div class="repo-item p-3 mb-3">
              <h3>${repo.name}</h3>
              <p>${repo.description ? repo.description : "No description"}</p>
          </div>
        </div>
      `
    ))
    $("#repositories").empty()

    reposDiv.forEach(div => {
      $("#repositories").append(div)
    })
  }
  
  const updatePrevNext = (headerLink) => {
    
    if (!headerLink) {
      return;
    }
  
    const links = headerLink.split(", ")
    
  
    
  
    links.forEach(link => {
      if (link.includes(`rel="next"`)) {
        next = link.split("; ")[0].slice(1, -1)
      }
  
      if (link.includes(`rel="prev"`)) {
        prev = link.split("; ")[0].slice(1, -1)
      }
  
    })
  }
const fetchUri = async (URI) => {
    if (!URI) {
      return { error: "URI endpoint is not defined" }
    }
  
    const response = await octokit.request(URI, {
      per_page: 10,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return response
  }
  


const getUserAndRepositories = async (username) => {
    try {
        // Fetch user information
        const userResponse = await octokit.request(`GET /users/${username}`);
        const user = userResponse.data;
        // Fetch profile data from an api

        document.addEventListener('DOMContentLoaded', async function () {
            const octokit = new Octokit();
        
            try {
                // Fetch user data
                const { data: user } = await octokit.request('GET /user');
        
                // Assuming the user object has an 'avatar_url' property
                const avatarUrl = user.avatar_url;
        
                // Set the profile picture dynamically
                setProfilePicture(avatarUrl);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        });
       
     
        const reposResponse = await octokit.request(`GET /users/${username}/repos`,{
            per_page: 10
        });
        const repositories = reposResponse.data;
        updatePrevNext(reposResponse.headers.link)
        // Update user information in the DOM
        $('#name1').text(user.name)
        $('#bio1').text(user.bio || 'Bio')
        $('#location').text(user.location)
        $('#user-name').val(user.login);
        $('#user-bio').text(user.bio || 'Bio or additional information about the user.');
        $('#followersCount').text(user.followers);
        $('#followingCount').text(user.following);
        $('#profile-link').text(user.html_url)
        $('#profile-pic').attr('src',user.avatar_url)
        // Update repositories in the DOM
        const repositoriesList = $('#repositories');
        repositoriesList.empty(); // Clear previous data

        repositories.forEach(repo => {
            const repoItem = `
          <div class="col-md-6 card_body">
            <div class="repo-item p-3 mb-3">
              <h3>${repo.name}</h3>
              <p>${repo.description || 'No description available'}</p>
              <p class="lang-use">${repo.language || 'Language not specified'}</p>
            </div>
          </div>`;
            repositoriesList.append(repoItem);
        });

        

    } catch (error) {
        console.error('Error fetching GitHub user information:', error);
    }
};

