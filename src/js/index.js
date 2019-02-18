import Search from './models/Search';

//Global state of the app, search object, current recipe object, shopping list object, liked recipes

const state ={};

const search = new Search('pizza');
search.getResults();

const controlSearch = async () => {

    // 1. get query from view
    const query = 'pizza' //ToDo

    if (query) {
        //2. new search object and add to state
        state.search = new Search(query);

        //3. Prepare ui for results

        //4. search for recipes
        await state.search.getResults();

        //5. render results on UI
        console.log(state.search.result)
    }
}

document.querySelector('.search').addEventListener('submit', (e) => {
    e.preventDefault();
    controlSearch();
});