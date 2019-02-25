import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';

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
			recipeView.renderRecipe(state.recipe);

		} catch (error) {
			alert('Error processsing recipe', error.name,error.stack, error.message);
			alert(error.name);
			alert(error.message);
			alert(error.stack);
		}
	}
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

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
	}
});

window.l = new List();