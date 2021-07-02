import "@babel/polyfill";
import env from "dotenv";
env.config();
import express from "express";
import { join } from "path";
import routes from "./routes";
import cors from "cors";

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Origin, Content-Type, Accept'
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });
  
  app.use(cors());
  
  app.use(express.json({ limit: '50mb', extended: true }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use(express.static(__dirname + '/public'));
  const publicImages = express.static(join(__dirname, '../uploads/'));
  app.use('/uploads', publicImages);

  app.use('/v1', routes);// now acces this with http://localhost/v1


app.get('/', (req, res)=>{
    res.send("Welcome to 20Kobo API");
});

app.listen(process.env.PORT || 3051, console.log(`App runnig on http://localhost:${process.env.PORT}`));
