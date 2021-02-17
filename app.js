const express = require('express');
const app = express();
const port = 3000;
const multer = require('multer');

const upload = multer({
  //storage config. Calls upon multer.diskStorage as we're saving the images on disk
  //if you don't have the need to have this much control over the file saving, you could just specify "dest". Check the multer documentation.
  storage: multer.diskStorage({
    //destination registers the path to where the file will be saved
    destination: (req, file, next) => {
      next(null, 'public/images');
    },
    //filename determines the exact name of the file, this is totally costumizable to whatever suits you best
    filename: (req, file, next) => {
      //mimetype of an image file looks like: "image/png"
      const extension = file.mimetype.split('/')[1];
      const filename = `${file.fieldname}-${Date.now()}.${extension}`;
      next(null, filename);
    }
  }),
  //here we implement the fileFilter middleware, also optional and costumizable
  fileFilter: (req, file, next) => {
    //we made it optional to send an image so no error if the file is not set
    if(!file){
      next();
    }
    //as we only want images, we create a filter using the mimetype once again and checking if it says "image"
    const isImageFile = file.mimetype.startsWith('image/');
    if(isImageFile){
      next(null, true);
    } else {
      next({message: "Wrong file type, please select an image."}, false);
    }
  }
}).single('image');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index.html');
})

app.post('/upload', (req, res) => {
  //to get the error handling, we must call upon upload inside the router function
  upload(req, res, function (err) {
    //there are other ways to do this, but errors related to multer specifications will be instances of multer.MulterError
    if(err instanceof multer.MulterError) {
      return res.end("Your image is probably too big")
    } 
    //while this second case will cover our errors thrown by fileFilter
    else if(err) {
      return res.end(err.message);
    }
    //in a normal aplication you would probably return the error or the file and store a reference to it in a database
    //since this is just an example, i'm printing the file object and returning the response
    if(req.file){
      console.log(req.file);
    }
    return res.redirect('/');
  });
})

app.listen(port, ()=>{
  console.log(`App running at http://localhost:${port}`);
})