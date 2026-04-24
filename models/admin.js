const mongoose=require('mongoose');
const express=require("express");

const app=express()

const adminSchema=new mongoose.Schema({
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

const Admin=mongoose.model('Admin', adminSchema)

module.exports=Admin;