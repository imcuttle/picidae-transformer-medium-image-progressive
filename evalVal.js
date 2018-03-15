/**
 * @file evalOptions
 * @author Cuttle Cong
 * @date 2018/3/13
 * @description 
 */

module.exports = function evalVal(val) {
  return eval('(function() { \n return ' + val + '\n})()')
}