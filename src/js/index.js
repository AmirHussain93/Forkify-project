import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

//Global state of the app, search object, current recipe object, shopping list object, liked recipes
const state ={};

/**SEARCH CONTROLLER*/
const controlSearch = async () => {

	// 1. get query from view
	const query = searchView.getInput();

	if (query) {
		//2. new search object and add to state
		state.search = new Search(query);

		//3. Prepare ui for results
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);

		try {
			//4. search for recipes
			await state.search.getResults();

			//5. render results on UI
			clearLoader();
			searchView.renderResults(state.search.result);
		} catch (error) {
			alert('Something wrong with the search');
			clearLoader();
		}
		
	}
}

elements.searchForm.addEventListener('submit', (e) => {
	e.preventDefault();
	controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	if (btn) {
			const goToPage = parseInt(btn.dataset.goto, 10);
			searchView.clearResults();
			searchView.renderResults(state.search.result, goToPage);
	}
});

/**RECIPE CONTROLLER*/
const controlRecipe = async () => {
	//Get id from url 
	const id = window.location.hash.replace('#', '');

	if (id) {
		// prepare ui for changes
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		// highlight the selected search item
		if (state.search) searchView.highlightSelected(id);
		// create new recipe object
		state.recipe =  new Recipe(id);

		try {
			// get recipe data and parse ingredients
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();

			// calculate servings and time
			state.recipe.calcTime();
			state.recipe.calcServings();

			// Render recipe
			clearLoader();
			recipeView.renderRecipe(
				state.recipe,
				state.likes.isLiked(id)
			);

		} catch (error) {
			alert('Error processsing recipe', error.name,error.stack, error.message);
			alert(error.name);
			alert(error.message);
			alert(error.stack);
		}
	}
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/* List controller **/
const controlList = () => {
	//Create a new list if there is none yet
	if (!state.list) state.list = new List();

	//add each ingredient to the list and UI
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	});
}

//handle delete and updat elist item events
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	//handle the delete button
	if (e.target.matches('.shopping__delete, .shopping__delete *')) {
		// Delete from state
		state.list.deleteItem(id);

		// Delete from UI
		listView.deleteItem(id);

		// handle the count update
	} else if (e.target.matches('.shopping__count-value')) {
		const val = parseFloat(e.target.value, 10);
		state.list.updateCount(id, val);
	}
});

// Likes controller
const controlLike = () => {
	if (!state.likes) state.likes = new Likes();
	const currentID = state.recipe.id;

	//user has not yet liked current recipe
	if (!state.likes.isLiked(currentID)) {
		// Add like to the state
		const newLike = state.likes.addLike(
			currentID,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
		);

		//Toggle the like button
		likesView.toggleLikedButton(true);

		//Add like to the UI list
		likesView.renderLike(newLike);
	} else {
		//user has liked current recipe
		//Remove like from the state
		state.likes.deleteLike(currentID);

		//Toggle the like button
		likesView.toggleLikedButton(false);

		//Remove like from UI list
		likesView.deleteLike(currentID);

	}
	likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on page load
window.addEventListener('load', () => {
	state.likes = new Likes();

	// Restore likes
	state.likes.readStorage();

	// Toggle like menu button 
	likesView.toggleLikeMenu(state.likes.getNumLikes());

	// Render the existing likes
	state.likes.likes.forEach(like => likesView.renderLike(like));
})

// Handling recipe button clicks 
elements.recipe.addEventListener('click', e => {
	if (e.target.matches('.btn-decrease, .btn-decrease *')) {
		// Decrease button is clicked
		if (state.recipe.servings > 1) {
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		// Increase button is clicked
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
	} else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
		//Add ingredients to shopping list
		controlList();
	} else if (e.target.matches('.recipe__love, .recipe__love *')) {
		//Like controller
		controlLike();
	}
});
