const axios = require('axios');
const mongoose = require('mongoose');
const Food = require('../models/food'); 
module.exports.data=function(req,res){
fetchAndStoreIndianFood();
async function fetchAndStoreIndianFood() {
    try {
        for (let letterCode = 97; letterCode <= 122; letterCode++) {
            const letter = String.fromCharCode(letterCode);
            const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
            const meals = response.data.meals;
            if (meals) {
                for (const meal of meals) {
                        const ingredients = await fetchIngredients(meal.idMeal);
                        const foodItem = {
                            FoodName: meal.strMeal,
                            FoodType: meal.strCategory,
                            FoodImage: meal.strMealThumb,
                            FoodRecipeYT:meal.strYoutube,
                            FoodRecipeMNL:meal.strInstructions,
                            FoodIngredients: ingredients
                        };
                        await Food.create(foodItem);
                        console.log('Data stored for:', meal.strMeal);
                }
            }
        }
        console.log('Data stored successfully');
    } catch (error) {
        console.error('Error fetching or storing data:', error);
    } finally {
        mongoose.disconnect();
    }
}

// Fetch ingredient details for a meal by ID
async function fetchIngredients(mealId) {
    try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const meal = response.data.meals[0];
        
        if (meal) {
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
                if (meal['strIngredient' + i]) {
                    ingredients.push({
                        name: meal['strIngredient' + i],
                        image: '' 
                    });
                }
            }
            return ingredients;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching ingredient data:', error);
        return [];
    }
}
}