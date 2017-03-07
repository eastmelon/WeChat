/**
 * Created by hudw on 2017/2/28.
 */
var express=require('express');
var router=express.Router();
router.get('/chat',function(req,res,next){
    res.render('index');
})
module.exports=router;