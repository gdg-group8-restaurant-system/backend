import express from 'express'
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favoriteController.js'

const favoriteRouter= express.Router()

favoriteRouter.get('/',getFavorites)
favoriteRouter.post('/:id',addFavorite),
favoriteRouter.delete('/:id',removeFavorite)

export default favoriteRouter