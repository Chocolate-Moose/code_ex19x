import { Router } from 'express';
import path from 'path';
import * as UserID from './controllers/user_controller';
import passport from './services/passport';
const router = Router();


//FIX:
//CAS is sending through the user in the form of --Emma P. Rafkin@DARTMOUTH.EDU--
//this is not helpful and doesnt really match to anything. we need to figure out how to get the server to send the netid or email 

//before any call, we need to call user.getNetid to switch the form from the gross cas thing to the netid


router.route('/')
    .get((req, res, next)=>{
    passport.authenticate('cas', (err, user, info)=>{
        console.log("user: "+user);
        if(err){return err;}
        if(!user){
            console.log("rejected");
            return res.redirect('/');
        }
        console.log('authed:' + JSON.stringify(user) + ' with ' + JSON.stringify(req.query));
        //search mongo db for user's crushes using user_controller
        let netid = "";
        UserID.getNetid(user)
            .then((ni)=>{
                    console.log(ni);
                    netid = ni.slice();
                    UserID.getCrushNumber(netid)
                            .then((crushes)=>{
                                console.log(crushes);
                                res.sendFile(path.join(__dirname+'/views/index.html'));
                            })
                            .catch((error)=>{
                                res.status(500).send(error.message);
                            });
                
                })        
            .catch((error)=>{
                console.log(error);
                res.status(500).send(error.message);
            });
        console.log("netid: " + netid);
        
    })(req, res, next);
    })
    router.route('/number')
    .get((req, res, next) => {
        passport.authenticate('cas', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/'); }
            UserID.getNetid(user)
            .then((ni)=>{
                    console.log(ni);
                    netid = ni.slice();
                    UserID.getCrushNumber(netid)
                            .then((crushes)=>{
                                console.log(crushes);
                                res.sendFile(path.join(__dirname+'/views/index.html'));
                            })
                            .catch((error)=>{
                                res.status(500).send(error.message);
                            });
                
                })        
            .catch((error)=>{
                console.log(error);
                res.status(500).send(error.message);
            });
        })(req, res, next);
    })

    router.route('/crushes')
    .get((req, res, next) => {
        passport.authenticate('cas', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/'); }
            console.log('authed:' + JSON.stringify(user) + ' with ' + JSON.stringify(req.query));
            //search mongo db for user's crushes using user_controller
            User.getCrushes(user)
                .then((crushes) => {
                    res.render('index', { crushes });
                })
                .catch((error) => {
                    res.status(500).send(error.message);
                })
        })(req, res, next);
    })
    .post((req, res, next) => {
        passport.authenticate('cas', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/'); }
            console.log('authed:' + JSON.stringify(user) + ' with ' + JSON.stringify(req.query));
//I call it req.body.crush as in that is what I'm assuming will be the crush's id
            User.getCrushes(req.body.crush)
                .then((results) => {
                    if(results.includes(user)){
                        User.updateMatches(user, req.body.crush);
                        User.updateMatches(req.body.crush, user);
                        User.updateCrushes(user, req.body.crush);
                    }else{
                        User.updateCrushes(user, req.body.crush);
                    }
                    res.render('index', { crushes });
                })
                .catch((error) => {
                    res.status(500).send(error.message);
                })

        })(req, res, next);
    })


router.route('/matches')
    .get((req, res, next)=>{
        passport.authenticate('cas', (err, user, info)=>{
            if(err){return next(err);}
            if(!user){return res.redirect('/');}
            console.log('authed:' + JSON.stringify(user) + ' with ' + JSON.stringify(req.query));

            //search mongo db for user's crushes using user_controller
            UserID.getMatches(user)
                .then((response)=>{
                    res.send(response);
                })
                .catch((error)=>{
                    res.status(500).send(error.message);
                })
        })(req, res, next);
        })
export default router;