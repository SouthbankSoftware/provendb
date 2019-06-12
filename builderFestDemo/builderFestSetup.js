
db.accounts.insertMany([
  {
    name: 'Guy',
    balance: 10000,
    transactions: []
  },
  { name: 'Mike', balance: 10000, transactions: [] }
]);

var delay=0;
var oneDay=1000*3600*24;
var edate=new Date();
db.accounts.update({name:'Guy'},{$set:{balance:5000},$push:{transactions:{timestamp:edate,to:'Mike',amount:5000,comment:'loan'}}},{multi:true});
db.accounts.update({name:'Mike'},{$set:{balance:15000},$push:{transactions:{timestamp:edate,from:'Guy',amount:5000,comment:'loan'}}},{multi:true});
db.submitProof();
sleep(delay);

 edate=new Date();
db.accounts.update({name:'Guy'},{$set:{balance:7500},$push:{transactions:{timestamp:edate,from:'Mike',amount:2500,comment:'repayment'}}},{multi:true});
db.accounts.update({name:'Mike'},{$set:{balance:12500},$push:{transactions:{timestamp:edate,to:'Guy',amount:2500,comment:'repayment'}}},{multi:true});
db.accounts.find().pretty();
db.submitProof();
sleep(delay);

 edate=new Date();
db.accounts.update({name:'Guy'},{$set:{balance:8500},$push:{transactions:{timestamp:edate,from:'Mike',amount:1000,comment:'repayment'}}},{multi:true});
db.accounts.update({name:'Mike'},{$set:{balance:11500},$push:{transactions:{timestamp:edate,to:'Guy',amount:1000,comment:'repayment'}}},{multi:true});
db.submitProof();
sleep(delay);

db.accounts.find().pretty();