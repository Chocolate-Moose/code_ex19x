import { Router } from 'express';
import path from 'path';
import * as UserID from './controllers/user_controller';
import passport from './services/passport';
const router = Router();


//FIX:
//CAS is sending through the user in the form of --Emma P. Rafkin@DARTMOUTH.EDU--
//this is not helpful and doesnt really match to anything. we need to figure out how to get the server to send the netid or email 

//before any call, we need to call user.getNetid to switch the form from the gross cas thing to the netid


//lol not actually logging them out because idk how to do that, but just rerouting them--hacks
router.route('/logout').get((req, res) => {
  res.send('Thanks for visiting last chances 19x!');
});



//
let crush_list_final = []; 
let match_list_final = [];
let user_final = undefined;
let netid_final = "";
let crush_number_final = 0;

router.route('/')
    .get((req, res, next)=>{

    //cas auth
    passport.authenticate('cas', (err, user, info)=>{
        user_final = user;
        console.log("user: "+user);
        if(err){return err;}
        if(!user){
            console.log("rejected");
            return res.redirect('/');
        }

        console.log('authed:' + JSON.stringify(user) + ' with ' + JSON.stringify(req.query));
        let netid = "";
        //get the net id of the user that CAS returns
        UserID.getNetid(user)
            .then((ni)=>{
                    //do we need to copy this?
                    netid = ni.slice();
                    //get the list of crushes
                    UserID.getCrushes(netid).then((crush_list)=>{
                        //get the list of matches
                        UserID.getMatches(netid).then((match_list) =>{
                            //get number of people crushing on them
                            UserID.getCrushNumber(netid)
                            .then((crushes)=>{
                                //save everything to the global variables
                                netid_final = netid;
                                crush_list_final = crush_list;
                                match_list_final = match_list;
                                crush_number_final = crushes;

                                //redirect them!
                                res.redirect('/main');
                            })
                            .catch((error)=>{
                                res.status(500).send(error.message);
                            });
                        }).catch((error)=>{
                            res.status(500).send(error.message);
                        });
                        
                    }).catch((error)=>{
                        res.status(500).send(error.message);
                    });
                })        
            .catch((error)=>{
                res.status(500).send(error.message);
            });
    })(req, res, next);
    })


    //this is the main page that will actualy display, otherwise the CAS auth ticket is still in the url and you can't reload which is annoying
    router.route('/main').get((req, res)=>{
        //format the name that is the CAS response
        let name = JSON.stringify(user_final);
        name = name.slice();
        name = name.substring(1, name.length);
        name=name.substring(0, name.indexOf('@'));

        //render the main page!
        res.render('index', {"crushes": crush_number_final, "user": name, "crush_list": crush_list_final, "match_list": match_list_final});
    });




    //ONLY A POST ENDPOINT
    // to update the crushes, matches, and crush number 
    router.route('/crushes')
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

export default router;