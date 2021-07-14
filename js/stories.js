'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug('generateStoryMarkup', story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <span class="star"><i class="far fa-star"></i></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function generateFaveStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="FV${story.storyId}">
      <span class="fvstar"><i class="fas fa-star"></i></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function generateUserStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`<li id="user${story.storyId}">
  <span class="trash"><i class="fas fa-trash-alt"></i></span>
  <span class="userstar"><i class="far fa-star"></i></span>
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>`);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug('putStoriesOnPage');

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  for (let story of storyList.stories) {
    for (let faveStory of currentUser.favorites)
      if (story.storyId === faveStory.storyId) {
        turnFaveStarOn(faveStory.storyId);
      }
  }
  $allStoriesList.show();
}
// Updates List of Favorite Stories to DOM
function putFaveStoriesOnPage() {
  console.debug('putFaveStoriesOnPage');
  const user = currentUser;
  $faveStoriesList.empty();

  // Loop through User's Favorite Stories and Generate HTML for Them
  for (let story of user.favorites) {
    const $story = generateFaveStoryMarkup(story);
    $faveStoriesList.append($story);
  }
}

function putUserStoriesOnPage() {
  console.debug('putUserStoriesOnPage');
  const user = currentUser;
  $userStoriesList.empty();
  for (let story of user.ownStories) {
    const $story = generateUserStoryMarkup(story);
    $userStoriesList.append($story);
  }
}

function showUserStories() {
  $allStoriesList.hide();
  hidePageComponents();
  putUserStoriesOnPage();
  $userStoriesList.show();
  for (let story of currentUser.ownStories) {
    if (checkFavoritesForStoryId(story.storyId)) {
      const star = $(`#user${story.storyId}`).children()[1];
      $(star).html('<i class="fas fa-star"></i>');
    }
  }
}

//Shows Favorite Stories
function showFaveStories() {
  $allStoriesList.hide();
  putFaveStoriesOnPage();
  $faveStoriesList.show();
  for (let story of currentUser.favorites) {
    turnFaveStarOn(story.storyId);
  }
}

// Adds Story to Favorites Based on storyID
async function addFaveStory(storyId) {
  const user = currentUser;
  try {
    const story = new Story(await getStoryById(storyId));
    await user.addFavorite(user, story);
    turnFaveStarOn(storyId);
    putFaveStoriesOnPage();
  } catch (e) {
    console.log(e);
  }
}

// Removes Story from Favorites Based on storyID
async function removeFaveStory(storyId) {
  const user = currentUser;
  try {
    const story = new Story(await getStoryById(storyId));
    await user.removeFavorite(user, story);
    turnFaveStarOff(storyId);
    putFaveStoriesOnPage();
  } catch (e) {
    console.log(e);
  }
}

// Sends Story from $submitForm to Backend API
async function submitStory(evt) {
  console.debug('submitStory', evt);
  evt.preventDefault();
  const user = currentUser;
  const newStory = {
    author: $('#create-author').val(),
    title: $('#create-title').val(),
    url: $('#create-url').val(),
  };
  try {
    await storyList.addStory(user, newStory);
  } catch (e) {
    console.log(e);
  }
  try {
    storyList = await StoryList.getStories();
    putStoriesOnPage();
  } catch (e) {
    console.log(e);
  }
}

async function deleteStory(storyId) {
  const user = currentUser;
  await storyList.deleteStory(user, storyId);
  showUserStories();
}

function checkFavoritesForStoryId(storyId) {
  for (let story of currentUser.favorites) {
    if (story.storyId === storyId) {
      return true;
    }
  }
  return false;
}

$submitForm.on('submit', submitStory);

// Gets Story from API based on storyID
async function getStoryById(storyId) {
  const story = await axios.get(`${BASE_URL}/stories/${storyId}`);
  return story.data.story;
}
