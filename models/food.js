const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    FoodName: {
        type: String,
        required: true
    },
    FoodType: {
        type: String,
        required: true
    },
    FoodImage: {
         type: String,
         required: true
    },
    FoodRecipeMNL: {
         type: String,
    },
    FoodRecipeYT: {
         type: String,
    },
    FoodIngredients: [
        {
            name: String,  
            image: String   
        }
    ]
});

const Food = mongoose.model('Food', userSchema);
module.exports = Food;
