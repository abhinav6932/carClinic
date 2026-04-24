const User=require('../models/user');
const Service=require('../models/service');
const Booking=require('../models/booking');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

exports.getLogin = (req, res) => {
    res.render('user/login');
};

exports.getRegister = (req, res) => {
    res.render('user/register');
};

exports.register=async(req,res)=>{
    try {
        const {fullname, email, password}=req.body;
        if (!fullname || !email || !password) {
            return res.render('user/register', { error: 'Fullname, email and password are required' });
        }

        const userExists=await User.findOne({email});
        if(userExists){
            return res.render('user/register', { error: 'User already exists' });
        }

        const hashedPassword=await bcrypt.hash(password, 10);
        const newUser=await User.create({
            fullname,
            email,
            password: hashedPassword
        });

        req.session.userId = newUser._id;
        req.session.userName = newUser.fullname;
        res.redirect('/auth/dashboard');
    } catch (error) {
        res.render('user/register', { error: 'Error registering user' });
    }
};

exports.login=async(req,res)=>{
    try {
        const {email, password}=req.body;
        const userExists=await User.findOne({email});
        if(!userExists){
            return res.render('user/login', { error: 'User not found' });
        }
        const isPasswordValid=await bcrypt.compare(password, userExists.password);
        if(!isPasswordValid){
            return res.render('user/login', { error: 'Invalid password' });
        }
        req.session.userId = userExists._id;
        req.session.userName = userExists.fullname;
        res.redirect('/auth/dashboard');
    }
    catch (error) {
        res.render('user/login', { error: 'Error logging in user' });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).lean();
        if (!user) {
            return res.redirect('/auth/login');
        }
        const bookings = await Booking.find({ user: user._id }).populate('service').sort({ bookedAt: -1 }).lean();
        res.render('user/dashboard', { user, bookingCount: bookings.length });
    } catch (error) {
        res.render('user/login', { error: 'Unable to load dashboard' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).lean();
        if (!user) {
            return res.redirect('/auth/login');
        }
        const bookings = await Booking.find({ user: user._id }).populate('service').sort({ bookedAt: -1 }).lean();
        res.render('user/profile', { user, bookings });
    } catch (error) {
        res.render('user/dashboard', { error: 'Unable to load profile', user: { fullname: req.session.userName } });
    }
};

exports.getBookServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 }).lean();
        const bookings = await Booking.find({ user: req.session.userId }).populate('service').sort({ bookedAt: -1 }).lean();
        res.render('user/bookServices', { services, bookings, success: req.query.success || null, error: null });
    } catch (error) {
        res.render('user/bookServices', { services: [], bookings: [], success: null, error: 'Unable to load services' });
    }
};

exports.postBookService = async (req, res) => {
    try {
        const { serviceId } = req.body;
        const service = await Service.findById(serviceId);
        if (!service) {
            const services = await Service.find().sort({ createdAt: -1 }).lean();
            const bookings = await Booking.find({ user: req.session.userId }).populate('service').sort({ bookedAt: -1 }).lean();
            return res.render('user/bookServices', { services, bookings, success: null, error: 'Service not found' });
        }

        await Booking.create({
            user: req.session.userId,
            service: service._id,
            serviceTitle: service.title,
            price: service.price,
            bookedAt: new Date(),
            status: 'Pending'
        });

        res.redirect('/auth/book-services?success=Service booked successfully');
    } catch (error) {
        console.error('Booking error', error);
        const services = await Service.find().sort({ createdAt: -1 }).lean();
        const bookings = await Booking.find({ user: req.session.userId }).populate('service').sort({ bookedAt: -1 }).lean();
        res.render('user/bookServices', { services, bookings, success: null, error: 'Unable to book service' });
    }
};

exports.logout=(req,res)=>{
    req.session.destroy((err) => {
        if (err) {
            return res.render('user/login', { error: 'Error logging out' });
        }
        res.redirect('/auth/login');
    });
};


