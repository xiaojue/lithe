define('common/readme',function(require,exports,module){
    var readme = '#lithe.js hello world!';
    readme += '\r\n-----\r\n';
    readme += '1.使用?debug参数切换上线与开发模式.';
    readme += '\r\n-----\r\n';
    readme += '2.删除data-debug选项，关闭head头中的节点';
    module.exports = readme;
});
