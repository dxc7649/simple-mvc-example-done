const models = require('../models');

const Cat = models.Cat.CatModel;

const Dog = models.Dog.DogModel;

const defaultData = {
    name: 'unknown',
    bedsOwned: 0,
};

const defaultDog = {
    name: 'unknown',
    breed: 'unknown',
    age: 0,
}

//latest cat
let lastAdded = new Cat(defaultData);

//latest dog
let lastDog = new Dog(defaultDog);

const hostIndex = (req, res) => {
    res.render('index', {
        currentName: lastAdded.name,
        title: 'Home',
        pageName: 'Home Page',
    });
};

//readd through all the cat
const readAllCats = (req, res, callback) => {
    Cat.find(callback).lean();
};

//read through all the dog
const readAllDogs = (req, res, callback) => {
    Dog.find(callback).lean();
};

//Find cat with specific name 
const readCat = (req, res) => {
    const name1 = req.query.name;

    const callback = (err, doc) => {
        if (err) {
            return res.status(500).json({
                err
            }); // if error, return it
        }

        // return success
        return res.json(doc);
    };

    Cat.findByName(name1, callback);
};

//Find dog with specific name 
const readDog = (req, res) => {
    const nameDog = req.query.name;

    const callback = (err, doc) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }

        return res.json(doc);
    };

    Dog.findDogName(nameDog, callback);
};

const hostPage1 = (req, res) => {
    const callback = (err, docs) => {
        if (err) {
            return res.status(500).json({
                err
            }); // if error, return it
        }

        // return success
        return res.render('page1', {
            cats: docs
        });
    };

    readAllCats(req, res, callback);
};

const hostPage2 = (req, res) => {
    res.render('page2');
};

const hostPage3 = (req, res) => {
    res.render('page3');
};

const hostPage4 = (req, res) => {
    const callback = (err, docs) => {
        if (err) {
            return res.status(500).json({
                err
            }); // if error, return it
        }

        // return success
        return res.render('page4', {
            dogs: docs
        });
    };

    readAllDogs(req, res, callback);
}

// function to handle get request to send the name
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const getName = (req, res) => {
    // res.json returns json to the page.
    // Since this sends back the data through HTTP
    // you can't send any more data to this user until the next response
    res.json({
        name: lastAdded.name
    });
};

const getDogName = (req, res) => {
    res.json({
        name: lastDog.name
    });;
}

const setName = (req, res) => {
    // check if the required fields exist
    // normally you would also perform validation
    // to know if the data they sent you was real
    if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
        // if not respond with a 400 error
        // (either through json or a web page depending on the client dev)
        return res.status(400).json({
            error: 'firstname,lastname and beds are all required'
        });
    }

    // if required fields are good, then set name
    const name = `${req.body.firstname} ${req.body.lastname}`;

    // dummy JSON to insert into database
    const catData = {
        name,
        bedsOwned: req.body.beds,
    };

    // create a new object of CatModel with the object to save
    const newCat = new Cat(catData);

    // create new save promise for the database
    const savePromise = newCat.save();

    savePromise.then(() => {
        // set the lastAdded cat to our newest cat object.
        // This way we can update it dynamically
        lastAdded = newCat;
        // return success
        res.json({
            name: lastAdded.name,
            beds: lastAdded.bedsOwned
        });
    });

    // if error, return it
    savePromise.catch((err) => res.status(500).json({
        err
    }));

    return res;
};

const setDogName = (req, res) => {
    if (!req.body.dogname || !req.body.age || !req.body.breed) {
        return res.status(400).json({
            error: 'name, breed and age are all required'
        });
    }

    const dogData = {
        name: req.body.dogname,
        breed: req.body.breed,
        age: req.body.age,
    };

    const newDog = new Dog(dogData);

    const savePromise = newDog.save();

    savePromise.then(() => {
        lastDog = newDog;

        res.json({
            name: lastDog.name,
            breed: lastDog.breed,
            age: lastDog.age
        });
    });

    savePromise.catch((err) => res.status(500).json({
        err
    }));

    return res;
};

const searchName = (req, res) => {
    if (!req.query.name) {
        return res.status(400).json({
            error: 'Name is required to perform a search'
        });
    }

    return Cat.findByName(req.query.name, (err, doc) => {
        if (err) {
            return res.status(500).json({
                err
            }); // if error, return it
        }

        if (!doc) {
            return res.json({
                error: 'No cats found'
            });
        }

        return res.json({
            name: doc.name,
            beds: doc.bedsOwned
        });
    });
};

const searchDogName = (req, res) => {
    if (!req.query.name) {
        return res.status(400).json({
            error: 'Name is required to perform a search'
        });
    }

    return Dog.findDogName(req.query.name, (err, doc) => {
        if (err) {
            return res.status(500).json({
                err
            }); // if error, return it
        }

        if (!doc) {
            return res.json({
                error: 'No dogs found'
            });
        }

        return res.json({
            name: doc.name,
            breed: doc.breed,
            age: doc.age
        });
    });
};

// function to handle a request to update the last added object
// this PURELY exists to show you how to update a model object
// Normally for an update, you'd get data from the client,
// search for an object, update the object and put it back
// We will skip straight to updating an object
// (that we stored as last added) and putting it back
const updateLast = (req, res) => {
    // Your model is JSON, so just change a value in it.
    // This is the benefit of ORM (mongoose) and/or object documents (Mongo NoSQL)
    // You can treat objects just like that - objects.
    // Normally you'd find a specific object, but we will only
    // give the user the ability to update our last object
    lastAdded.bedsOwned++;

    // once you change all the object properties you want,
    // then just call the Model object's save function
    // create a new save promise for the database
    const savePromise = lastAdded.save();

    // send back the name as a success for now
    savePromise.then(() => res.json({
        name: lastAdded.name,
        beds: lastAdded.bedsOwned
    }));

    // if save error, just return an error for now
    savePromise.catch((err) => res.status(500).json({
        err
    }));
};

// function to handle a request to any non-real resources (404)
// controller functions in Express receive the full HTTP request
// and get a pre-filled out response object to send
const notFound = (req, res) => {
    // res.render takes a name of a page to render.
    // These must be in the folder you specified as views in your main app.js file
    // Additionally, you don't need .jade because you registered the file type
    // in the app.js as jade. Calling res.render('index')
    // actually calls index.jade. A second parameter of JSON can be passed into
    // the jade to be used as variables with #{varName}
    res.status(404).render('notFound', {
        page: req.url,
    });
};

// export the relevant public controller functions
module.exports = {
    index: hostIndex,
    page1: hostPage1,
    page2: hostPage2,
    page3: hostPage3,
    page4: hostPage4,
    
    readCat,
    readDog,
    
    getName,
    getDogName,
    
    setName,
    setDogName,
    
    updateLast,
    
    searchName,
    searchDogName,
    
    notFound,
};
