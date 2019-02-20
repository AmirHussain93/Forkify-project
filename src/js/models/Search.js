import axios from 'axios';
import { key } from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {    
        
        // const key = '742aa2d90487b6548c73c085cfccf13e';
        // const key = '462b1cc8d4f2730081462fbc65136320';
        try {
            const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            // console.log(this.result)
        } catch(error) {
            alert(error);
        }
   }
}

// getResult('pizza');