// hexgen.js

    // ******************** Generating Hex from assembly
    //ADM starting work of generation!
    //let's prefer strings of characters
function linkitzApp_hexgen_byte_2_hex(data){
    if(typeof(data)=="string"){
        //assert(data.length<=2);
        //FIXME I could check contents of data better
        if(data.length<2){
            return linkitzApp_hexgen_byte_2_hex("0"+data);
        } else if(data.length>2){
            return data[data.length-2]+data[data.length-1];
        } else {
            return data;
        }
    }
    else if(typeof(data)=="number"){
        //assert(number>=0);
        //assert(number<=255);
        return linkitzApp_hexgen_byte_2_hex(data.toString(16));
    }
}

function linkitzApp_hexgen_append_checksum(data){
    var data_pointer;
    var checksum=0;
    for(data_pointer=0;data_pointer<data.length;data_pointer+=2){
        checksum+=(parseInt(data[data_pointer],16)<<4)+parseInt(data[data_pointer+1],16);
    }

    checksum=-checksum;
    checksum=(checksum%256+256)%256;

    return data+linkitzApp_hexgen_byte_2_hex(checksum);
}

function linkitzApp_hexgen_make_hex_line(address,data){
    //if address is a string we should convert to a number
    if(typeof(address) == "string"){
        address = parseInt(address, 16);
    }
    //data should be a string of hex data
    var byte_count = data.length/2;

    var output = ":"+linkitzApp_hexgen_append_checksum(linkitzApp_hexgen_byte_2_hex(byte_count)+linkitzApp_hexgen_byte_2_hex(address>>8)+linkitzApp_hexgen_byte_2_hex(address)+"00"+data)+"\n";
    return output;
}

function linkitzApp_hexgen_pad_words(byte){
    return linkitzApp_hexgen_byte_2_hex(byte)+"38";
}

function linkitzApp_hexgen_identify_Rreg(name){
    //console.log("identifying src by name:"+name);
    var isolateNumberRegex=/r(\d+)/i;
    match = isolateNumberRegex.exec(name);
    //console.log("found:"+match[1]);
    if(match==null){
        throw("could not find an Rreg in:"+name);
    }
    return linkitzApp_hexgen_pad_words(match[1]);
}

function linkitzApp_hexgen_generate_hex(assembly_code) {
    var hex_output="";
    var unlinkedCodeLines = [];//this is the list of code segments that don't yet have addresses for the goto commands
    var currentCodeBlock;
    var labels = {};
    var code_offset = 0x3000;
    var code_end = 0x3EFE;

    //labels["OnRegularEvent"]=code_offset+0;
    var address=code_offset;

    //we're prepared for parsing
    var assembly_lines = assembly_code.toLowerCase().split("\n");
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
            labels[label_and_data[0]] = address;
            //console.log("setting labels["+label_and_data[0]+"]to:"+address);
            token_list = label_and_data[1].trim().split(/\s+/);
        } else {//line is of the form data
            token_list=line.trim().split(/\s+/);
        }

/*
    Instruction Space
    05:Syscall
        00: Syscall exit
        01: Set_Reg_Event_Speed
        02: FlashHue
    06:ArglessSyscall (Syscall)
        01: GetMotionData
        02: FlashRGB 
    08:Set
    09:Goto
    0A:Push
    0B:Pop
    10:BAND3
    11:BOR3
    12:ADD
    13:SUB
    14:MUL
    15:DIV
    


    BD:Reserved indicates error

*/
    var hex_line="";
    //console.log("token_list is:"+token_list);
        if(token_list.length==0||token_list[0]==""){
            //console.log("skipping empty line")
        } else if(token_list[0].match(/band3/i)){
            throw("code to handle band3 isn't yet written")
        }else if(token_list[0].match(/syscall/i)){
            //console.log("processing syscall")
            //identify if it's a syscall with no arguments or with one
            if( token_list[1].match(/exit/i)||
                token_list[1].match(/flashHue/i)||
                token_list[1].match(/set_reg_event_speed/i)){

                //console.log("syscall should have one argument")
                hex_line+=linkitzApp_hexgen_pad_words("05");

                //identify syscall type
                if(token_list[1].match(/exit/i)){
                    hex_line+=linkitzApp_hexgen_pad_words("00");
                } else if(token_list[1].match(/set_reg_event_speed/i)){
                    hex_line+=linkitzApp_hexgen_pad_words("01");
                } else if(token_list[1].match(/flashHue/i)){
                    hex_line+=linkitzApp_hexgen_pad_words("02");
                } else {
                    throw("could not match second token of syscall in line:"+line);
                }

                //identify source
                hex_line+=linkitzApp_hexgen_identify_Rreg(token_list[2]);
                unlinkedCodeLines.push([address,hex_line,token_list]);
                address+=6;

            } else if(token_list[1].match(/flashRGB/i)||
                token_list[1].match(/getmotiondata/i)){
            //flashRGB takes it's arguments from the top of the stack.
            //get_motion_data places arguments onto the stack 
            //it implicitly pops a list off of the stack.
                //console.log("syscall has no arguments")
                hex_line+=linkitzApp_hexgen_pad_words("06");
                if(token_list[1].match(/flashRGB/i)){
                    hex_line+=linkitzApp_hexgen_pad_words("01");
                } else if(token_list[1].match(/getmotiondata/i)){
                    hex_line+=linkitzApp_hexgen_pad_words("02");
                } else {
                    hex_line+=linkitzApp_hexgen_pad_words("BD");
                }
                unlinkedCodeLines.push([address,hex_line,token_list]);
                address+=4;
            } else {
                console.log("ERROR: No rule to process syscall:"+token_list[1]);
            }
        } else if(token_list[0].match(/set/i)){
            hex_line+=linkitzApp_hexgen_pad_words("08");
            //identify source
            hex_line+=linkitzApp_hexgen_identify_Rreg(token_list[1]);


            hex_line+=linkitzApp_hexgen_pad_words(token_list[2]);
            unlinkedCodeLines.push([address,hex_line,token_list]);
            address+=6;
        } else if(token_list[0].match(/goto/i)){
            hex_line+=linkitzApp_hexgen_pad_words("09");
            hex_line+=linkitzApp_hexgen_pad_words("BD");
            hex_line+=linkitzApp_hexgen_pad_words("BD");
            unlinkedCodeLines.push([address,hex_line,token_list]);
            address+=6;
        } else if(token_list[0].match(/push/i)){
            hex_line+=linkitzApp_hexgen_pad_words("0A");
            hex_line+=linkitzApp_hexgen_identify_Rreg(token_list[1]);
            unlinkedCodeLines.push([address,hex_line,token_list]);
            address+=4;
        } else if(token_list[0].match(/pop/i)){
            hex_line+=linkitzApp_hexgen_pad_words("0B");
            hex_line+=linkitzApp_hexgen_identify_Rreg(token_list[1]);
            unlinkedCodeLines.push([address,hex_line,token_list]);
            address+=4;
        } else {
            throw("Could not match token: \""+token_list[0]+"\" in: "+line);
        }
    }
    console.log("DONE ASSEMBLING CODE...LINKING...");
    for(line_ptr=0;line_ptr<unlinkedCodeLines.length;line_ptr++){
        var linkedaddr = unlinkedCodeLines[line_ptr][0];
        var linkhex_line = unlinkedCodeLines[line_ptr][1];
        var tokens = unlinkedCodeLines[line_ptr][2]
        if(tokens[0].match(/goto/i)){
            linkhex_line = linkitzApp_hexgen_pad_words("09");
            //console.log("matching label:"+tokens[1]);
            var targetAddr = labels[tokens[1]];
            //console.log("targetAddr:"+targetAddr);
            linkhex_line+=linkitzApp_hexgen_pad_words(linkitzApp_hexgen_byte_2_hex(Math.floor(targetAddr/256)));
            linkhex_line+=linkitzApp_hexgen_pad_words(linkitzApp_hexgen_byte_2_hex((targetAddr)%256));
            hex_output+=linkitzApp_hexgen_make_hex_line(linkedaddr,linkhex_line);
        } else {
            hex_output+=linkitzApp_hexgen_make_hex_line(linkedaddr,linkhex_line);
        }
        //console.log("token list:"+tokens+" Places hex:"+linkhex_line+" At addr:"+linkedaddr);
        
    }
    hex_output+=":00000001FF\n";

//        var output = assembly_code+";Start HEX Record\n"+hex_output;

    return hex_output;
}



var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('HexGenerator', ['$rootScope', 'LogService', '$q', function($rootScope, LogService, $q) {
    //The below aliases are how we currently acess these things in the app, 
    //I'm using the above because the webap doesn't load angular and can't use this.
    function byte_2_hex(data){
        return linkitzApp_hexgen_byte_2_hex(data);
    }

    function append_checksum(data){
        return linkitzApp_hexgen_append_checksum(data);
    }

    function make_hex_line(address,data){
        return linkitzApp_hexgen_make_hex_line(address,data);
    }

    function pad_words(byte){
        return linkitzApp_hexgen_pad_words(byte);
    }

    function generate_hex(assembly_code) {
        return linkitzApp_hexgen_generate_hex(assembly_code);
    }

    function processAssembly(assemblyText) {
        var deferred = $q.defer();

        LogService.appLogMsg("Generated code input:\n" + assemblyText);

        try {
            var hexOutput = linkitzApp_hexgen_generate_hex(assemblyText);

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
