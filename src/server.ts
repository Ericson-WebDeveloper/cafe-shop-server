import express, { Express, Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import { apiRouteNotFound, errorHanlder } from "./middleware/errorHandler";
import routerAuth from "./routes/auth";
import UserClass from "./class/UserClass";
import routerCategory from "./routes/category";
import routerVariant from "./routes/variant";
import routerProduct from "./routes/product";
import routerCart from "./routes/cart";
import routerOrder from "./routes/order";
import routerPayment from "./routes/payment";
import routerDashBoard from './routes/dashboard';

export const serverApplication = (app: Application) => {
    app.use(express.json({ limit: "100mb" }));
    app.use(express.urlencoded({ extended: true }));

    const frontend_domain: string = process.env.NODE_ENV == "DEV" ? <string>process.env.FRONT_URL : <string>process.env.FRONT_PROD_URL;
    const whitelist = [frontend_domain];
    const corsOptions: CorsOptions = {
        origin: (origin, callback) => {
        if (whitelist.indexOf(origin!) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('System Origin Restricted'));
        }
        },
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
        credentials: true,
        optionsSuccessStatus: 200
    };
    
    app.use(cors(corsOptions));
    app.use(cookieParser());

    // routes
    app.use('/api/authentication', routerAuth);
    app.use('/api/dashboard', routerDashBoard);
    app.use('/api/category', routerCategory);
    app.use('/api/variant', routerVariant);
    app.use('/api/product', routerProduct);
    app.use('/api/cart', routerCart);
    app.use('/api/order', routerOrder);
    app.use('/api/payment', routerPayment);
    // test porpose
    app.get("/api/test-route", (req: Request, res: Response) => {
        return res.status(200).json({users: UserClass.userSearch(null)})
    });
    // test porpose

    app.get('/api/*', apiRouteNotFound);
    app.get('/*', apiRouteNotFound);
    app.use(errorHanlder);
    
    return app;
};
