// Monkey patching existing mongoose library to add custom caching logic whenever a 
// query is executed

const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);


//original exec function that is executed anytime a query ran
const exec = mongoose.Query.prototype.exec;

//all the model instances will have access to a function we named cache
//caching will be enabled when cache is tagged on the function chain on a query
mongoose.Query.prototype.cache = function(options={}){
    this.useCache=true;
    //key will be an empty string if user does not pass a options object
    //JSON.stringify is applied because redis stores strings
    this.hashKey = JSON.stringify(options.key || '');

    //which makes cache() a chainable function
    return this;
}


// no arrow function is used because it affects the 'this' property
mongoose.Query.prototype.exec =async function(){
    //query being exec() doesn't wanna be cached because it did not have .cache() added to its call.
    if(!this.useCache){
        return exec.apply(this,arguments);
    }


    //'this' refers to the object calling the .exec method
   
    //key value pair is like
    // {_user:'sadsadsadadas',collection:'blogs}
    const key = JSON.stringify(Object.assign({},this.getQuery(),{
        collection:this.mongooseCollection.name
    }))

    //See if we have a value for 'key' in redis
    //hget is used for nested get
    const cacheValue = await client.hget(this.hashKey,key);


    //If we do, return that
    if(cacheValue){
        // model is a function every mongoose model instance has that turns
        // json object into mongoose document. i.e. adding all the required functions etc
        // const doc =new this.model(JSON.parse(cacheValue));

        const doc = JSON.parse(cacheValue);

        //is doc an Array(meanining more than 1 model instance returned)
        return Array.isArray(doc)
        ?  doc.map(d=>new this.model(d))
        : new this.model(doc);
    }
    //Otherwise, issue the query and store the result in redis


    // apply() method calls a function with a given this value and arguments provided as an array
    // exec() will run as is with addition of the console.log.
    // we have added additional functionality to the function
    //returns the result of the query that is calling this exec function
    const result = await exec.apply(this,arguments);
    //i.e call the exec() function on the instance that is calling it with the 
    //arguments

    //we must store results as Json strings in redis
    client.hmset(this.hashKey,key,JSON.stringify(result),'EX',10);
    return result;
}

//this function can be exported, and it will clear any hash from that is given to it
module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}