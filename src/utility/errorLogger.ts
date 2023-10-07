import path from 'path';
import { getDateTimeNow } from './dateUtility';
import moment from 'moment';
import fs from 'fs';
import os from 'os';

var dir = path.join(__dirname, '..', '/config/logs');
var date = getDateTimeNow();
var folder = moment(date).format('MMMM Do YYYY');
var DateTime = moment(date).format('MMMM Do YYYY, h:mm:ss a');

const checkAndCreateDir = () => {
    if (!fs.existsSync(dir)){
        return false;
        // fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(dir+"/"+folder)){
        fs.mkdirSync(dir+"/"+folder, { recursive: true });
    }
}

const formattingContent = (data: any) => {
    return `${DateTime} - ${data} ${os.EOL}`
}

export const loggerErrorData = (error: any) => {
    let content = (typeof error == 'string') ? error : JSON.stringify(error);
    checkAndCreateDir();
    // check if have file Error Logs
    if (!fs.existsSync(dir+"/"+folder+"/Error-Logs-"+folder+".txt")){
        fs.writeFileSync(dir+"/"+folder+"/Error-Logs-"+folder+".txt",formattingContent(content), {flag:'a+'});
    } else {
      fs.appendFile(dir+"/"+folder+"/Error-Logs-"+folder+".txt",formattingContent(content), {encoding: 'utf8', flag: 'a+'}, () => {

      });  
    }
}
