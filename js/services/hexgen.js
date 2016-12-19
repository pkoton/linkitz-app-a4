// hexgen.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('HexGenerator', ['$rootScope', 'LogService', '$q', function($rootScope, LogService, $q) {

    // ******************** Generating Hex from assembly
    //ADM starting work of generation!
    //let's prefer strings of characters
    function byte_2_hex(data){
        if(typeof(data)=="string"){
            //assert(data.length<=2);
            //FIXME I could check contents of data better
            if(data.length<2){
                return byte_2_hex("0"+data);
            } else if(data.length>2){
                return data[data.length-2]+data[data.length-1];
            } else {
                return data;
            }
        }
        else if(typeof(data)=="number"){
            //assert(number>=0);
            //assert(number<=255);
            return byte_2_hex(data.toString(16));
        }
    }

    function append_checksum(data){
        var data_pointer;
        var checksum=0;
        for(data_pointer=0;data_pointer<data.length;data_pointer+=2){
            checksum+=(parseInt(data[data_pointer],16)<<4)+parseInt(data[data_pointer+1],16);
        }

        checksum=-checksum;
        checksum=(checksum%256+256)%256;

        return data+byte_2_hex(checksum);
    }

    function make_hex_line(address,data){
        //if address is a string we should convert to a number
        if(typeof(address) == "string"){
            address = parseInt(address, 16);
        }
        //data should be a string of hex data
        var byte_count = data.length/2;

        var output = ":"+append_checksum(byte_2_hex(byte_count)+byte_2_hex(address>>8)+byte_2_hex(address)+"00"+data)+"\n";
        return output;
    }

    function pad_words(byte){
        return byte_2_hex(byte)+"38";
    }

    function generate_hex(assembly_code) {
        var hex_output="";
        var labels = {};
        var variable_list = {};
        variable_list["R0"]=[0,0];
    //constants
        var code_offset = 0x3000;
        var code_end = 0x3EFE;
        var default_code_head = 0x3C00;

        var stackptr=1;
        //labels["OnRegularEvent"]=code_offset+0;
        var address=code_offset;

        //we're prepared for parsing
        var assembly_lines = assembly_code.split("\n");
        var line_ptr;
        //first three lines store
        	//list of list variables
        	//list of scalar variables
        	//list of all registers
        for(line_ptr=2;line_ptr<assembly_lines.length;line_ptr++){
            //Parse a line
            var line = assembly_lines[line_ptr];
            var token_list;
            //throw(tokens);


            //line is of the form "label:data"
            if(line.match(/.+:.*/)){
                var label_and_data=line.split(":");
                labels[label_and_data] = address;
                token_list = label_and_data[1].trim().split(/\s+/);
            } else {//line is of the form data
                token_list=line.trim().split(/\s+/);
            }
/*
//Following format is depricated for now
            //line is of the form "var item"
            if(token_list[0].match(/var/i)){
                //FIXME I shouldn't be hardcoded at length 3
                //variableList[token_list[1]]=[3,stackptr];
                //FIXME I should write when declared instead of when instantiated
                //throw("variable "+token_list[1]+" declared");
                //stackptr+=3;
            }
*/
        var hex_line="";
        //throw("token_list is:"+token_list);
        	if(token_list.length==0||token_list[0]==""){
        	} else if(token_list[0].match(/syscall/i)){
                hex_line+=pad_words("05");

                //identify syscall type
                if(token_list[1].match(/exit/i)){
                    hex_line+=pad_words("00");
                } else if(token_list[1].match(/flashRGB/i)){
                //flashRGB takes it's arguments from the top of the stack. 
                //it implicitly pops a list off of the stack.
                    hex_line+=pad_words("01");
                } else if(token_list[1].match(/flashHue/i)){
                //flashHue 
                    hex_line+=pad_words("02");
                }  else {
                    throw("could not match second token of syscall in line:"+line);
                }

                //identify source
	            if(token_list[2].match(/r0/i)){
	                hex_line+=pad_words("00");
	            } else {
	                if(!(token_list[2] in variable_list)){
	                    throw("could not find source:"+token_list[2]);
	                }
	                hex_line+=pad_words(variable_list[token_list[2]]);
	            }//FIXME see if I can match the token to the variableList
	            hex_output+=make_hex_line(address,hex_line);
	            address+=6;

	        } else if(token_list[0].match(/set/i)){
                hex_line+=pad_words("08");
                //identify source
                if(!token_list[1].match(/.+\+.+/)){
                    if(!(token_list[1] in variable_list))//can't find source but I can create it
                    {
                        variable_list[token_list[1]]=stackptr;
                        //throw("variable_list["+token_list[1]+"]="+variable_list[token_list[1]]);
                        stackptr+=token_list[2];//FIXME should probably convert to int
                    }
                    hex_line+=pad_words(variable_list[token_list[1]])
                } else {
                    var subtokens = token_list[1].split("+");
                    var baseVar = parseInt(variable_list[subtokens[0]],16);
                    var offsetVar = parseInt(subtokens[1],16);
                    var adjustedVar = baseVar + offsetVar;

                    //throw("write to "+variable_list[subtokens[0]]+"+"+subtokens[1]);
                    hex_line+=pad_words(adjustedVar);
                }

                hex_line+=pad_words(token_list[2]);
                hex_output+=make_hex_line(address,hex_line);
                address+=6;
            } else if(token_list[0].match(/goto/i)){
            	hex_line+=pad_words("09");
            } else if(token_list[0].match(/push/i)){
            	hex_line+=pad_words("0A");
            } else if(token_list[0].match(/pop/i)){
            	hex_line+=pad_words("0B");
            } else {
            	throw("Could not match token: \""+token_list[0]+"\" in: "+line);
            }
        }

        //hex_output = "checksum for 01 is:"+append_checksum("01")+"\n";
        //hex_output=     make_hex_line(0x3000,"08");//checksum should be C7
        //hex_output=hex_output+make_hex_line(0x3001,"3801");
        //hex_output=hex_output+make_hex_line(0x3003,"380338");
        //hex_output=hex_output+make_hex_line(0x3006,"08380238AC38");
        //hex_output=hex_output+make_hex_line(0x300C,"08380338ED38");
        //hex_output=hex_output+make_hex_line(0x3012,"083804388038");
        //hex_output=hex_output+make_hex_line(0x3018,"053801380138");
        //hex_output=hex_output+make_hex_line(0x301E,"053800380038");
        hex_output+=":00000001FF\n";

//        var output = assembly_code+";Start HEX Record\n"+hex_output;

        return hex_output;
    }

    function processAssembly(assemblyText) {
        var deferred = $q.defer();

        LogService.appLogMsg("Generated code input:\n" + assemblyText);

        try {
            var hexOutput = generate_hex(assemblyText);

    //        var hexOutput = ":0630000008380138033816\n:0630060008380238AC3866\n:06300C0008380338ED381E\n:0630120008380438803884\n:0630180005380138013803\n:06301E00053800380038FF\n:00000001FF\n";
    //        var hexOutput = ":0C30000005380138003805380038003869\n:00000001FF\n";

            LogService.appLogMsg("Generated hex output:\n" + hexOutput);

            deferred.resolve(hexOutput);
        }
        catch (err) {
            deferred.reject(err);
        }

        return deferred.promise;
    }

    return{
    	processAssembly: processAssembly,
    };

}]);
