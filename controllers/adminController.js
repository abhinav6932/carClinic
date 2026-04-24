const Admin=require('../models/admin');
const Service=require('../models/service');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

exports.getLogin = (req, res) => {
    res.render('admin/login');
};

exports.getRegister = (req, res) => {
    res.render('admin/register');
};

exports.register=async(req,res)=>{
    try {
        const {fullname, email, password}=req.body;
        const adminExists=await Admin.findOne({email});
        if(adminExists){
            return res.render('admin/register', { error: 'Admin already exists' });
        }
        const hashedPassword=await bcrypt.hash(password, 10);
        const newAdmin=await Admin.create({
            fullname,
            email,
            password: hashedPassword
        });
        req.session.adminId = newAdmin._id;
        req.session.adminName = newAdmin.fullname;
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('admin/register', { error: 'Error registering admin' });
    }
};

exports.login=async(req,res)=>{
    try {
        const {email, password}=req.body;
        const adminExists=await Admin.findOne({email});
        if(!adminExists){
            return res.render('admin/login', { error: 'Admin not found' });
        }
        const isPasswordValid=await bcrypt.compare(password, adminExists.password);
        if(!isPasswordValid){
            return res.render('admin/login', { error: 'Invalid password' });
        }
        req.session.adminId = adminExists._id;
        req.session.adminName = adminExists.fullname;
        res.redirect('/admin/dashboard');
    }
        catch (error) {
        res.render('admin/login', { error: 'Error logging in admin' });
    }
};

exports.dashboard = (req, res) => {
    res.render('admin/dashboard');
};

exports.getAddService = (req, res) => {
    res.render('admin/addService');
};

exports.addService = async (req, res) => {
    try {
        console.log('=== Add Service Request ===');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        console.log('Session:', req.session);

        const { title, description, price } = req.body;
        const parsedPrice = parseFloat(price);
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        console.log('Parsed data:', { title, description, price, parsedPrice, image });

        if (!title || !description || isNaN(parsedPrice) || parsedPrice < 0 || !image) {
            console.log('Validation failed');
            return res.render('admin/addService', { error: 'All fields are required, including image, and price must be a valid number', title, description, price });
        }

        console.log('Creating service...');
        const newService = await Service.create({ title, description, price: parsedPrice, image });
        console.log('Service created successfully:', newService._id);
        res.redirect('/admin/services');
    } catch (error) {
        console.error('=== Error saving service ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        res.render('admin/addService', { error: `Unable to save service: ${error.message}`, title: req.body.title, description: req.body.description, price: req.body.price });
    }
};

exports.getServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.render('admin/services', { services });
    } catch (error) {
        res.render('admin/services', { services: [], error: 'Unable to load services' });
    }
};

exports.getEditService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.redirect('/admin/services');
        }
        res.render('admin/editService', { service });
    } catch (error) {
        res.redirect('/admin/services');
    }
};

exports.editService = async (req, res) => {
    const { title, description, price } = req.body;
    const parsedPrice = parseFloat(price);
    if (!title || !description || isNaN(parsedPrice) || parsedPrice < 0) {
        const service = { _id: req.params.id, title, description, price: parsedPrice };
        return res.render('admin/editService', { error: 'All fields are required and price must be a valid number', service });
    }
    try {
        const existingService = await Service.findById(req.params.id);
        const image = req.file ? `/uploads/${req.file.filename}` : existingService.image;
        const service = await Service.findByIdAndUpdate(req.params.id, { title, description, price: parsedPrice, image }, { new: true, runValidators: true });
        if (!service) {
            return res.redirect('/admin/services');
        }
        res.redirect('/admin/services');
    } catch (error) {
        const service = { _id: req.params.id, title, description, price: parsedPrice };
        res.render('admin/editService', { error: 'Unable to save changes', service });
    }
};

exports.deleteService = async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
    } catch (error) {
        console.error('deleteService error', error);
    }
    res.redirect('/admin/services');
};

exports.logout=(req,res)=>{
    req.session.destroy((err) => {
        if (err) {
            return res.render('admin/login', { error: 'Error logging out' });
        }
        res.redirect('/admin/login');
    });
};


