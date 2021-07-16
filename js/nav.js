'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navAllStories(evt) {
  console.debug('navAllStories', evt);
  hidePageComponents();
  putStoriesOnPage();
}
$body.on('click', '#nav-all', navAllStories);

// Show User's Favorite Stories when user clicks "Favorites"
function navFaveStories(evt) {
  hidePageComponents();
  console.debug('navFaveStories', evt);
  showFaveStories();
}
$body.on('click', '#nav-favorites', navFaveStories);

// Show User's Own Stories when user clicks My Stories
function navUserStories(evt) {
  hidePageComponents();
  console.debug('navUserStories', evt);
  showUserStories();
}
$body.on('click', '#nav-stories', navUserStories);

/** Show login/signup area on click on "login" */
function navLoginClick(evt) {
  console.debug('navLoginClick', evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}
$navLogin.on('click', navLoginClick);

/** When a user first logs in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug('updateNavOnLogin');
  $('.main-nav-links').show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// Remove Main Navbar on click on "logout"
function navLogOutClick(evt) {
  console.debug('navLogOutClick', evt);
  $('.main-nav-links').hide();
  $navLogin.show();
  $navLogOut.hide();
  $navUserProfile.hide();
}
$navLogOut.on('click', navLogOutClick);

// Display Submit Story Form on click of Submit Link
function displayStorySubmitForm(evt) {
  console.debug('displayStorySubmitForm', evt);
  hidePageComponents();
  $submitForm.css('display', 'flex');
}
$body.on('click', '#nav-submit', displayStorySubmitForm);

// Toggles Favorite Star On on M ain Stories Section

function turnFaveStarOn(storyId) {
  const star = $(`#${storyId}`).children()[0];
  $(star).html('<i class="fas fa-star"></i>');
}

// Toggles Favorite Star Off on Main Stories Section
function turnFaveStarOff(storyId) {
  const star = $(`#${storyId}`).children()[0];
  $(star).html('<i class="far fa-star"></i>');
}

// Updates favorites in Main Section if Star is Clicked
$body.on('click', '.star', async function () {
  if (currentUser) {
    const storyId = $(this).parent().attr('id');
    if (!checkFavoritesForStoryId(storyId)) {
      await addFaveStory(storyId);
    } else await removeFaveStory(storyId);
  }
  // Alternative possibility could be removing star element if user is not logged in.  Could be changed later
  else {
    alert('Please log in to add a story to favorites');
  }
});

// Updates Favorites in Favorite Section if Clicked - can probably be refactored later
$body.on('click', '.fvstar', async function () {
  if (currentUser) {
    const storyId = $(this).parent().attr('id').substr(2);
    if (!checkFavoritesForStoryId(storyId)) {
      await addFaveStory(storyId);
    } else await removeFaveStory(storyId);
  } else {
    alert('Please log in to add a story to favorites');
  }
});

// Updates Favorites in User Stories if Clicked - can probably be refactored later
$body.on('click', '.userstar', async function () {
  if (currentUser) {
    const storyId = $(this).parent().attr('id').substr(4);
    if (!checkFavoritesForStoryId(storyId)) {
      await addFaveStory(storyId);
      $(this).html('<i class="fas fa-star"></i>');
    } else {
      await removeFaveStory(storyId);
      $(this).html('<i class="far fa-star"></i>');
    }
  } else {
    alert('Please log in to add a story to favorites');
  }
});

// Remove Story in User Stories by Clicking Trash Icon
$body.on('click', '.trash', async function () {
  const storyId = $(this).parent().attr('id').substring(4);
  await deleteStory(storyId);
});
