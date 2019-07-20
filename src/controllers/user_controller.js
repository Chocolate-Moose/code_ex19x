import User from '../models/user_model';
import { model } from 'mongoose';


//TODO: switch out all the find by emails to find by net id

export const getNetid = (payload) =>{

    //THIS IS JUST A TEST TO CHECK IF IT CONNECTS TO THE DB--NOT ACTUALLY TO BE USED
    return new Promise((resolve, reject)=>{
        let name = JSON.stringify(payload);
        name = name.slice();
        name = name.replace(".", "");
        name = name.substring(1, name.length);
        name=name.substring(0, name.indexOf('@'));
        name = name.replace(/ /g,".");
        User.findOne({ "email" : {$regex: name, $options:'i'}}, {"netid":1})
            .then((foundNetID) =>{
                if (foundNetID !== null) {
                    resolve(foundNetID["netid"]);
                  } else {
                    reject(new Error(`User with email: ${foundNetID["netid"]} not found--is this the error?`));
                  } 
            })
            .catch((error) => {
                reject(error);
              })
        
    })};    


export const getCrushes = (user) => {
    return new Promise((resolve, reject) => {
        // grab user object or send 404 if not found
        
        User.findOne({ "netid": user }, {"crushes":1})
          .then((foundCrushes) => {
            if (foundCrushes !== null) {
              resolve(foundCrushes["crushes"]);
            } else {
              reject(new Error(`User with netid: ${user} not found`));
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
};
export const getCrushNumber = (user) => {
    return new Promise((resolve, reject) => {
        // grab user object or send 404 if not found
        
        User.findOne({ "netid": user }, {"crushingNumber":1})
          .then((foundCrushes) => {
            if (foundCrushes !== null) {
              resolve(foundCrushes["crushingNumber"]);
            } else {
              reject(new Error(`User with email: ${user} not found--testing that this is get crush number`));
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
};
export const getMatches = (user) => {
    return new Promise((resolve, reject) => {
        // grab user object or send 404 if not found
        User.findOne({ "netid": user }, {"matches":1})
          .then((foundMatches) => {
            if (foundMatches !== null) {
              resolve(foundMatches["matches"]);
            } else {
              reject(new Error(`User with email: ${user} not found`));
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
};

//update user's crush list, but also update crush's crushingNumber
const updateCrushes = (user, crush) => {
    return new Promise((resolve, reject) => {
      let crushes = User.findOne({ "email": user },{"crushes":1})
      crushes = crushes.push(crush);
      User.updateOne({ "email": user }, {"crushes": crushes})
        .then(() => {
          // grab user object or send 404 if not found
          User.findOne({ "email": user })
            .then((foundUser) => {
              if (foundUser !== null) {
                resolve(foundUser);
              } else {
                reject(new Error(`User with email: ${user} not found`));
              }
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });  
    //this might be an issue--having two resolves 
    const cn = User.findOne({"email": crush}, {"crushingNumber":1})+1;
    User.updateOne({ "email": crush }, {"crushingNumber": cn})
        .then(() => {
          // grab user object or send 404 if not found
          User.findOne({ "email": crush })
            .then((foundUser) => {
              if (foundUser !== null) {
                resolve(foundUser);
              } else {
                reject(new Error(`User with email: ${crush} not found`));
              }
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });  
    });
  };

  
  const updateMatches = (user, match) => {
    return new Promise((resolve, reject) => {
      let matches = User.findOne({"email": user },{"matches":1});
      matches.push(match);
      User.updateOne({ "email": user }, {"matches": matchArray})
        .then(() => {
          // grab user object or send 404 if not found
          User.findOne({ "email": user })
            .then((foundUser) => {
              if (foundUser !== null) {
                resolve(foundUser);
              } else {
                reject(new Error(`User with email: ${user} not found`));
              }
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  