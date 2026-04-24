const mongoose=require('mongoose');
const express=require("express");
const { type } = require('express/lib/response');
const app=express()

const userSchema=new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})

const User=mongoose.model('User', userSchema)

module.exports=User;