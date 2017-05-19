
process.env.NODE_ENV = 'test';
//Require the dev-dependencies
let request  = require("request");
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');
let should = chai.should();
let expect = require("chai").expect;

chai.use(chaiHttp);

var image_search_path = "/api/imagesearch/";
var recent_history_path = "/api/recent/";
var home_path = "/";

describe('basic set up', () => {
    it('it should have status 200' + image_search_path, (done) => {
        chai.request(server)
            .get(image_search_path)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
    it('it should have status 200' + recent_history_path, (done) => {
        chai.request(server)
            .get(recent_history_path)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
    it('it should have status 200' + home_path, (done) => {
        chai.request(server)
            .get(home_path)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
})

describe('basic function', () => {
    it('The url of the search should return a 200 status' , (done) => {
        chai.request(server)
            .get(image_search_path + "cats")
            .end((err, res) => {
                if (err) console.error(err);
                res.should.have.status(200);
                resText = JSON.parse(res.text);
                console.log(resText[0]);
                request.get(resText[0].url, function(err, res, body){
                        if (err) console.error(err);
                        expect(res.statusCode).to.eq(200);
                        done();
                    })

            });

    })
    it('After I make a search, that search should be top of the history' , (done) => {
        chai.request(server)
            .get(image_search_path + "lolcatz")
            .end((err, res) => {
                res.should.have.status(200);
                chai.request(server)
                    .get(recent_history_path)
                    .end((err, res) => {
                        if (err) console.error(err);
                        res.should.have.status(200);
                        resText = JSON.parse(res.text);
                        expect(resText[0].term).to.equal("lolcatz");
                        done();
                    })

            });
    })    
});
