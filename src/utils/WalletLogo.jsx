const context = require.context('../assets/images/token', true, /.png$/);
const obj = {};
context.keys().forEach((key) => {
  const tokenSymbol = key.split('./').pop() 
    .substring(0, key.length - 6); 
  obj[tokenSymbol] = context(key);
});
export default obj;