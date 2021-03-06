const laptop = require('../models/laptop.js');
const order = require('../models/order.js');
const session = require('../models/session.js');

class apiController {

    //  [GET] /getLaptopList
    getLaptopList(req, res) {
        laptop.get(req.con, function (err, laptops) {
            res.json(laptops);
        })
    }

    //  [GET] /getBrand
    getBrand(req, res) {
        laptop.getBrand(req.con, function (err, brands) {
            var data = [];
            data = brands.map(function (brand) {
                return brand['brand'];
            })
            res.json(data);
        })
    }

    //  [GET] /getLaptopById/:id
    getLaptopById(req, res) {
        laptop.getById(req.con, req.params.id, function (err, laptop) {
            res.json(laptop[0]);
        })
    }

    //  [GET] /getLaptopBySlug/:slug
    getLaptopBySlug(req, res) {
        laptop.getBySlug(req.con, req.params.slug, function (err, laptop) {
            res.json(laptop[0]);
        })
    }

    //  [GET] /getLaptopByBrand/:brand
    getLaptopByBrand(req, res) {
        laptop.getByBrand(req.con, req.params.brand, function (err, laptop) {
            res.json(laptop);
        })
    }

    //  [GET] /getLaptopByPrice
    getLaptopByPrice(req, res) {
        let price = {
            a: req.query.a * 1000000,
            b: req.query.b * 1000000,
        }
        laptop.getByPrice(req.con, price, function (err, laptop) {
            res.json(laptop);
        })
    }

    // [GET] /getCart
    getCart(req, res) {
        const sessionId = req.signedCookies.sessionId;
        if (!sessionId) { res.redirect("/"); return; }
        session.find(req.con, { sessionId }, function (err, sessions) {
            if (err) console.log(err);
            if (!sessions[0]) {
                res.redirect("/");
                return;
            }
            let data = JSON.parse(sessions[0].value);
            let products = [];
            for (const dt in data) {
                let product = {};
                product.id = dt;
                product.value = data[dt];
                laptop.getById(req.con, product.id, function (err, laptops) {
                    product.name = laptops[0].laptop_name;
                    product.image = laptops[0].img;
                    product.price = Intl.NumberFormat().format(laptops[0].price);
                    products.push(product);
                });
            }
            setTimeout(() => {
                res.json(products);
            }, 100);
        })
    }

    //  [GET] /getOrder/:id
    getOrder(req, res, next) {
        order.getById(req.con, req.params.id, function (err, orders) {
            var order = orders[0];
            let data = JSON.parse(order.products);
            var productList = [];
            for (const dt in data) {
                laptop.getById(req.con, dt, function (err, laptops) {
                    const lap = laptops[0];
                    lap.price = Intl.NumberFormat().format(lap.price);
                    lap.value = data[dt];
                    productList.push(lap);
                })
            }
            setTimeout(function () {
                res.json(productList);
            }, 500)
        })
    }

}

module.exports = new apiController;
