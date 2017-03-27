// firmware.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('LinkitzFirmware',
    ['$q',
    '$rootScope',
    'LogService',
    function($q, $rootScope, LogService) {

    var latestFirmwareEmbedded =
        ":041208008A31902A6D\n" +
        ":101210007E1489312000111C1829CE3097009601C8\n" +
        ":101220008A31A42289312000CC01CC0A11108E2AE7\n" +
        ":101230000B1D8E2A613095005A08AB000330AB05B8\n" +
        ":101240005A08AA00FC30AA0503302B020630031806\n" +
        ":10125000762AF0002B088F31DD278931A900CD3E99\n" +
        ":101260008600870101082A0203183829013039292C\n" +
        ":101270000030A7002908CE3E8600870101082A0217\n" +
        ":1012800003184429013045290030A8002908CF3E21\n" +
        ":101290008600870101082A020318502901305129CC\n" +
        ":1012A0000030A5002908D03E8600870101082A02E7\n" +
        ":1012B00003185C2901305D290030A3002908D13EC4\n" +
        ":1012C0008600870101082A0203186829013069296C\n" +
        ":1012D0000030A6002908D23E8600870101082A02B4\n" +
        ":1012E00003187429013075290030A4002B08533EDF\n" +
        ":1012F00086008701010BB1292B08563E8600230882\n" +
        ":101300000112031D01162B08563E86002708011006\n" +
        ":10131000031D01142B08563E860028088110031D6A\n" +
        ":1013200081142B08563E860026088111031D811565\n" +
        ":101330002B08563E860024080111031D01152B08B9\n" +
        ":10134000563E860025088112031D81162B08013E9A\n" +
        ":10135000F2002B08563E860001088A319E22893110\n" +
        ":10136000852A2B08533E8600033087010106031DA2\n" +
        ":10137000EE292B08563E860023080112031D011694\n" +
        ":101380002B08563E860027080113031D01172B0862\n" +
        ":10139000563E860028088110031D81142B08563EF6\n" +
        ":1013A000860026088111031D81152B08563E8600F4\n" +
        ":1013B00024080111031D01152B08563E860025083F\n" +
        ":1013C0008112031D81162B08013EF2002B08563EA8\n" +
        ":1013D000860001088A3198228931852A2B08533EDC\n" +
        ":1013E0008600023087010106031D852AA001A00A9C\n" +
        ":1013F0002708031DFF292308031DFF29A00120083A\n" +
        ":10140000A700A101A10A2808031D0A2A2608031D16\n" +
        ":101410000A2AA1012108A800A201A20A2508031D89\n" +
        ":10142000152A2408031D152AA2012B08563E860002\n" +
        ":10143000870127080110031D01142B08563E860062\n" +
        ":1014400028088110031D81142B08563E86002608AB\n" +
        ":101450000111031D01152B08013EF2002B08563E19\n" +
        ":10146000860001088A3192228931852A04305E0281\n" +
        ":10147000031C4D2A5B088B314C238931043020003A\n" +
        ":10148000DE025F02031C4B2A5D088B315223893137\n" +
        ":1014900004302000DF02DC0A792AFF308B3152232E\n" +
        ":1014A00089312000DB0A5B08F200F301F20A03191C\n" +
        ":1014B000F30A0630F000F1018E31BF268931700841\n" +
        ":1014C000DD005F08DE005B08F200F301F20A031999\n" +
        ":1014D000F30A0630F000F1018E31BF268931700821\n" +
        ":1014E000C73E860087010108DF0006305B02031C4F\n" +
        ":1014F000362A06305B06031D852A3F305C02031C3A\n" +
        ":10150000842ADC01DB01852ADC0AFE3020005A0631\n" +
        ":10151000031D8C2ACE01CE0ADA0A0B117E100900B7\n" +
        ":1015200091312729F3007208F0007308DB230800CB\n" +
        ":10153000F3007208F0007308DB230800F300720860\n" +
        ":10154000F0007308DB23080080238A31B0228A313F\n" +
        ":10155000003A03190800CB30C7238A31042408005D\n" +
        ":1015600000308B1B0130F4001B248A31D8228A31D1\n" +
        ":10157000F501F60115248A3103197502031CBA2AF4\n" +
        ":1015800021000E14F501F60115248A3103197502A4\n" +
        ":10159000031CC42A003020000E180130F300DD22A5\n" +
        ":1015A0008A31741CD52A8B17D62A8B13730808002E\n" +
        ":1015B00021000D1320000D13082C0E17CB2308005B\n" +
        ":1015C000F6000630F000750882238A31013EF800EB\n" +
        ":1015D00000308B1B0130F7008B13FA01F901F61F65\n" +
        ":1015E000FC2A75084C238A317A08031DF92A013038\n" +
        ":1015F000FA2A0030FA00FF2A78084C238A314B304F\n" +
        ":10160000F000F10138238A31FF3052238A3119303A\n" +
        ":10161000F000F10138238A31F63580238A31083011\n" +
        ":10162000F90A7902031CEF2A7A080319222B75089C\n" +
        ":101630004C238A317A08031D1F2B0130202B0030E8\n" +
        ":10164000FA00252B78084C238A314B30F000F10149\n" +
        ":1016500038238A31FF3052238A311930F000F101EA\n" +
        ":1016600038238A31771C362B8B1708008B13080020\n" +
        ":101670007008710403190800CA30F2000130F30049\n" +
        ":10168000F2020030F33B720873040130031D402B5B\n" +
        ":10169000F0020030F13B382BF1009A238A317108B7\n" +
        ":1016A00052230800F000003A0319702B013A031985\n" +
        ":1016B000722B033A0319752B013A0319772B073A5A\n" +
        ":1016C0000319792B013A03197C2BFA3A03196A2B77\n" +
        ":1016D0007E2B080021008D1320008D139731AB2F36\n" +
        ":1016E00097315D2F21009731752F97317D2F9731DD\n" +
        ":1016F000542F210097316D2F9731842F9731C72FA9\n" +
        ":1017000064000800F2000830F300F4017208F100F0\n" +
        ":101710000730F136890B892B74357104F400F235EA\n" +
        ":1017200070087402031C962B7008F402F30B862BCE\n" +
        ":1017300074080800F000AF2BAE2C21008E160800B4\n" +
        ":1017400021000E16080021008D17080021008E16BA\n" +
        ":10175000080021000E16080021008D1708007008EF\n" +
        ":10176000003A03199D2B013A0319A02B033A0319E0\n" +
        ":10177000A32B013A0319A62B073A0319A92B013A07\n" +
        ":101780000319AC2BFA3A03199C2BC62B0800FB005B\n" +
        ":10179000F501E0220800F201F20A7208F000720876\n" +
        ":1017A0009731B6278A31DB238A310430F20A72027C\n" +
        ":1017B00003180800CD2BF100973134278A317108C6\n" +
        ":1017C0002400910020009119F32BE22B8C168C122F\n" +
        ":1017D000012C8E158E11012C0E150E11012C973136\n" +
        ":1017E0009D278A31012C7008013A0319E62B033A30\n" +
        ":1017F0000319E92B013A0319EC2BFC3A0319EF2BDF\n" +
        ":10180000012C2400951208007B2480311C2808003C\n" +
        ":101810000D1221008E1320008E138C128E110E11CA\n" +
        ":1018200021000E1320000E130800F50A0319F60A12\n" +
        ":1018300009307602F6348B1321000E1020000E10B2\n" +
        ":101840000800973113278A312E248A31003A031970\n" +
        ":101850000800CB30973125278A31712C00308B1B43\n" +
        ":1018600001302000B0001B248A3158248A31B10194\n" +
        ":10187000B20175248A3103193102031C392C21006D\n" +
        ":101880000E142000B101B20175248A31031931020E\n" +
        ":10189000031C442C00300E180130AF005D248A3147\n" +
        ":1018A000301C542C8B17552C8B1320002F0808004C\n" +
        ":1018B00021000D1320000D13082C0E175F2CAE0114\n" +
        ":1018C000AE0A2E08AC002E089731B6278A31953122\n" +
        ":1018D000AA258A3120000430AE0A2E02031808001F\n" +
        ":1018E000612C7B2480311C280800B10A0319B20A3C\n" +
        ":1018F00009303202F6348B1320000E1721000E132C\n" +
        ":101900000800AC00962CAE2C21008E160800210099\n" +
        ":101910000E16080021008D17080021008E16080001\n" +
        ":1019200021000E16080021008D1708002C08003A2F\n" +
        ":101930000319842C013A0319872C033A03198A2CC2\n" +
        ":10194000013A03198D2C073A0319902C013A031917\n" +
        ":10195000932CFA3A0319832CAD2C080021008D1723\n" +
        ":1019600018308E0408004308BA004208B900A030BD\n" +
        ":10197000BB0046258C312100B9013908533E860051\n" +
        ":101980000430870101060319D82C3908533E86001C\n" +
        ":10199000023001060319D82C39089731D1278C3130\n" +
        ":1019A0000319D82C39089731D6278C31031D0C2DFB\n" +
        ":1019B000B80106302000AC00210039089331D22351\n" +
        ":1019C0008C31A03E210038072000C400063E86006E\n" +
        ":1019D0008701210038082000C500C6015E268C3131\n" +
        ":1019E0000B268C312C084207C7002D08433DC80048\n" +
        ":1019F00045084707C9004608483DCA004908840011\n" +
        ":101A00004A08850003310008810021000330B80A2C\n" +
        ":101A1000380203183A2DD92C3908533E8600870125\n" +
        ":101A2000010303191A2D3908533E860003300106BD\n" +
        ":101A3000031D3A2D20004308BA004208B9005E2673\n" +
        ":101A40008C310B262C08C4002D08C5004408B907AA\n" +
        ":101A50004508BA3D0330B9070318BA0A0630AC008E\n" +
        ":101A6000210039089331D2238C31063EA03EBB00C1\n" +
        ":101A700046258C3121000330B90A3902031CBD2CE4\n" +
        ":101A8000A0302000AC000030AD00202E44268C3168\n" +
        ":101A90000108031D502D390858268C3103196C2D6F\n" +
        ":101AA000390886003A0887004231390884003A082C\n" +
        ":101AB0008500013135268C310108AC00AD0144268A\n" +
        ":101AC0008C310108AE00AF010B268C316D268C31B4\n" +
        ":101AD000E6258C313208712D390886003A088700D6\n" +
        ":101AE0000136BF00390886003A0887003F08010226\n" +
        ":101AF000BC00390858268C31031D822D52268C31AA\n" +
        ":101B000003199A2D390886003A08870042313F268A\n" +
        ":101B10008C3135268C3141314A268C3142310108D5\n" +
        ":101B2000AE00AF010B268C316D268C31E6258C3151\n" +
        ":101B300032089D2D44268C310136C00044268C315C\n" +
        ":101B400040080102BD0052268C31031DAC2D4426F5\n" +
        ":101B50008C3101080319C02D44268C313F268C316D\n" +
        ":101B600035268C3142314A268C310108AE00AF0156\n" +
        ":101B70000B268C316D268C31E6258C313208C32D35\n" +
        ":101B800067268C310136C100672641080102BE007C\n" +
        ":101B90003B08860087013F0881003B0A86003D081C\n" +
        ":101BA00081003B08023E8600410881003B08033E5D\n" +
        ":101BB00086003C0881003B08043E86004008810006\n" +
        ":101BC0003B08053E86003E0881000800B701B801C9\n" +
        ":101BD000320833040319062EB601B60AB31BF32DDF\n" +
        ":101BE000B235B30DED2DB735B80D33083502031DF1\n" +
        ":101BF000FB2D32083402031C022E3208B4023308D3\n" +
        ":101C0000B53B3714B336B20CB60BF32D3808B3001E\n" +
        ":101C10003708B2000800B001B1012C1C132E2E08A9\n" +
        ":101C2000B0072F08B13DAE35AF0DAD36AC0C2C086A\n" +
        ":101C30002D04031D0D2E3108AD003008AC00080046\n" +
        ":101C4000B0013008C73E860087013008AE00AF0102\n" +
        ":101C50002C0784002F082D3D8500000881001830D6\n" +
        ":101C6000B00A300203180800212E00080107B20054\n" +
        ":101C7000B301B30D390886003A0887000800390817\n" +
        ":101C800084003A0885000800390886003A08870071\n" +
        ":101C9000413108000108AC00AD01390886003A085E\n" +
        ":101CA00087000800390886003A0887000108080004\n" +
        ":101CB00086003A08870042310108080021003908EF\n" +
        ":101CC0002000AC000330AD01AE00AF0108003908C0\n" +
        ":101CD00086003A088700423108002D08B5002C081C\n" +
        ":101CE000B400080000308B1B01302000AE00210042\n" +
        ":101CF00017082000B1008B13FF30AC000030953185\n" +
        ":101D0000AA258E3120000E1321000E13FF309631CC\n" +
        ":101D100043268E312200971321001D100D160D173A\n" +
        ":101D20002000CE01CE0ACC01CC0A210017081438BD\n" +
        ":101D3000D539970000300B1901302000AF000B118E\n" +
        ":101D4000003011180130B00011106300200031087C\n" +
        ":101D50002100970020002E1CAF2E8B17B02E8B1366\n" +
        ":101D600020002F1CB52E0B15B62E0B112000301C99\n" +
        ":101D7000BC2E200011140800200011100800F501ED\n" +
        ":101D8000F31FC92EF209F309F20A0319F30AF50148\n" +
        ":101D9000F50AF11FD02EF009F109F00A0319F10A32\n" +
        ":101DA000700871040319EB2EF401F40AF11BDB2E09\n" +
        ":101DB000F035F10DD52E71087302031DE12E700868\n" +
        ":101DC0007202031CE72E7008F2027108F33BF13631\n" +
        ":101DD000F00CF40BDB2E75080319F32EF209F3094E\n" +
        ":101DE000F20A0319F30A7308F1007208F000080000\n" +
        ":101DF0004F08AC00AD012D0826278E310319082F9E\n" +
        ":101E00002D084F3E86001F278E31AD0AFB2EAD0AEE\n" +
        ":101E10002D084F3E860087011F278E312D084F3E2B\n" +
        ":101E2000860001080319182F03302D02031C072F09\n" +
        ":101E30002D084F3E860087012C08810008002D08E0\n" +
        ":101E4000503E840085010008810008004F3E860056\n" +
        ":101E5000870101080800B401B501B601B7012C1CC7\n" +
        ":101E6000392F3008B4073108B53D3208B63D330884\n" +
        ":101E7000B73DB035B10DB20DB30DAF36AE0CAD0CF4\n" +
        ":101E8000AC0C2F082E042D042C04031D2F2F370813\n" +
        ":101E9000AF003608AE003508AD003408AC000800CD\n" +
        ":101EA000BB0080305902031C602F0F30973125276B\n" +
        ":101EB000200038088600013087000F3081000800BC\n" +
        ":101EC0005908703EB9002330BA01BA3D390886007E\n" +
        ":101ED0003A0887003B088100D90308002000B800B9\n" +
        ":101EE00080305902031C7F2FCF30973125272000E7\n" +
        ":101EF0003808860001308700CF3081008034D90A4D\n" +
        ":101F0000822708005908703E860023308701873DEC\n" +
        ":101F10000108080031089F278F3100088100310A2D\n" +
        ":101F200086002F08840030088500013100088100F8\n" +
        ":101F30003108023E9F270231000881000800860018\n" +
        ":101F400087012F0884003008850008009131CF29CF\n" +
        ":101F50009131D4299131D7299131DA299131DD2973\n" +
        ":101F60009131E5299231252A9131EE299131F929D2\n" +
        ":101F70009131FB299231032A9231082A92310D2A9C\n" +
        ":101F8000C030210095055A3020009500613099003D\n" +
        ":101F900098011110210011140B08E038EF398B0063\n" +
        ":101FA00008006400013080010131FE020030FF3B77\n" +
        ":101FB0007F087E0403190034D22FF200F10170086B\n" +
        ":101FC0007218F107F035F2367208031DDF2F710821\n" +
        ":101FD000080000346A34963485343D343D34573437\n" +
        ":041FE00057345734E7\n" +
        ":10221E009326380803398F31262791314523913182\n" +
        ":10222E00932691313808C5004730B1000030B20016\n" +
        ":10223E004508DF2391314730C2000030C300BB2E6A\n" +
        ":10224E00F0308400223085000030FE000130FF00A7\n" +
        ":10225E008F31D12791314B308400003085001530FD\n" +
        ":10226E00FE000030FF008F31D1279131C130840044\n" +
        ":10227E00003085001E30FE000030FF008F31D12768\n" +
        ":10228E0091310130E0000030E100E200E3007E1009\n" +
        ":10229E0020005129152791314B24913100304523CF\n" +
        ":1022AE0091310630CC2791318E2191317C29CD018F\n" +
        ":1022BE0021001830BC01BD008E2191317C294B24A8\n" +
        ":1022CE008C312124913120000030CC0145239131F5\n" +
        ":1022DE000330CC2791318E2191312100C0017C2910\n" +
        ":1022EE00CE019E2391312100C00020004D08031D18\n" +
        ":1022FE005E294C08031D66294E08031D772921000F\n" +
        ":10230E00400803197C298E31722691317C292200D6\n" +
        ":10231E00B0010508A1000408A00021003C08003E01\n" +
        ":10232E00BE0080303D3DBF003E0884003F08850062\n" +
        ":10233E007F302000D900200000082200AB00840A64\n" +
        ":10234E000319850AF0302B052100BE00103A031D3B\n" +
        ":10235E00012B200000082A2391312200B3004E27C2\n" +
        ":10236E0091312A2391312200B4004E27913122005F\n" +
        ":10237E00AE000408013E2100BE000030053DBF0046\n" +
        ":10238E003E082200B10021003F082200B200182AA8\n" +
        ":10239E003308AD003408AD05252A33083404142A59\n" +
        ":1023AE0033083407142A34083302142A3408200060\n" +
        ":1023BE00AC0022003308D2239131EC2934082000DE\n" +
        ":1023CE00AC0022003308B92391312200142AA60151\n" +
        ":1023DE0033080319F72934080319F729A601A60AA9\n" +
        ":1023EE002608142A3308012A3308031D002A013057\n" +
        ":1023FE00012A00303406142A34083302031C112A31\n" +
        ":10240E00132A330834020318112A132A3308340608\n" +
        ":10241E00031D132A0130142A0030AD00252ACA30BC\n" +
        ":10242E00FF2A2B08F03E031C162A84000D300402EE\n" +
        ":10243E000318162A8F310435A63E82002D08DB279D\n" +
        ":10244E0091313723913122006C2A2000000822009E\n" +
        ":10245E00A4004E2791312200A500240885002508EE\n" +
        ":10246E006F2A912791314E279131BA0022002E0802\n" +
        ":10247E0037239131840A0319850AA2292000000806\n" +
        ":10248E002200A2004E2791312200AF00840A0319C8\n" +
        ":10249E00850A832A0508B2000408B1000330A7009C\n" +
        ":1024AE0028302000B1000130B20022002F082A236C\n" +
        ":1024BE009131DF23913127302100BA000130BB006A\n" +
        ":1024CE00672391312A2AEA27913132088500310893\n" +
        ":1024DE008400A229EA279131932691313808BA0057\n" +
        ":1024EE0022002F08282A21088500200884002F08A2\n" +
        ":1024FE002A2391312200FF2A2208003A03197A2A50\n" +
        ":10250E00013A03196A2A033A0319512A013A0319A7\n" +
        ":10251E00712A252B200000082200A300840A03192B\n" +
        ":10252E00850AB02A0508B2000408B1002000D90AB5\n" +
        ":10253E005908703E2100BE002330BF01BF3D3E084A\n" +
        ":10254E00BA003F08BB0067238F3182279131D9072C\n" +
        ":10255E002A2A2308003A03196A2A013A0319992AEA\n" +
        ":10256E00252B9127840A0319850A30308F316E2767\n" +
        ":10257E009131BA0022002E08372391312200300803\n" +
        ":10258E000319A2293008FF2A8B2791310319850AD6\n" +
        ":10259E0030302000B80022002F082A238F31502718\n" +
        ":1025AE009131C52A91279131840A0319850AA427EE\n" +
        ":1025BE009131DB27913137239131A2298B2791312C\n" +
        ":1025CE000319850A2F082A2391312100BE00F1300C\n" +
        ":1025DE008600223087003E088100A229A42791316F\n" +
        ":1025EE000319A229033084070318850AA229C130D2\n" +
        ":1025FE00AC00262B22002B08003A0319252B053A96\n" +
        ":10260E000319452A033A0319912A0E3A0319382A57\n" +
        ":10261E00013A03192C2A033A0319CB2A013A03195A\n" +
        ":10262E00B82A073A0319252B3C3A0319D92A013A3D\n" +
        ":10263E000319E52A713A0319F52AFE2AA2292C0854\n" +
        ":10264E0003190800252F2000AC002C0803190034B4\n" +
        ":10265E002C08F03E860022308701873D01080800D5\n" +
        ":10266E002000BD00F03EBB002230BC01BC3D3B084B\n" +
        ":10267E0086003C0887003A08810008002000AC0064\n" +
        ":10268E00AD012D084F3E8600870101082C06031967\n" +
        ":10269E00612B0330AD0A2D060319612B482B2D0833\n" +
        ":1026AE004F3E860087012D084E3E840085010008AE\n" +
        ":1026BE008100AD032D08031D562B2C08CF000800FA\n" +
        ":1026CE003A0886003B088700033001020318702B7E\n" +
        ":1026DE000F293A0886003B088700063001023A08A7\n" +
        ":1026EE000318822B013E2000C200003021003B3D2A\n" +
        ":1026FE002000C300BB2E86003B0887001830010265\n" +
        ":10270E003A080318942B013E2000C200003021002D\n" +
        ":10271E003B3D2000C3008C31B32C013E2000AC00A9\n" +
        ":10272E00003021003B3D2000AD008E31202EAC014B\n" +
        ":10273E00AC0AAD012D08C73E8600870101080319BA\n" +
        ":10274E00B22B2D08C73E86002D08C73E840085019A\n" +
        ":10275E0000368100AC011830AD0A2D02031CA12BEE\n" +
        ":10276E002C0808002000AD00AF012C080319D02B57\n" +
        ":10277E00AE01AE0AAC1BC52BAC35C02BAF352C0849\n" +
        ":10278E002D02031CCD2B2C08AD022F14AC36AE0B34\n" +
        ":10279E00C52B2F0808002000AE00AD012C082E1806\n" +
        ":1027AE00AD07AC35AE362E08031DD52B2D0808000F\n" +
        ":1027BE00B7005530AC00370833249131D63E792618\n" +
        ":1027CE009131B600FA30AC003608D2239131FF3E7B\n" +
        ":1027DE00B8002B3037020318FA2BFF30B900380837\n" +
        ":1027EE00BA00BB01212C553037020318022C3808D1\n" +
        ":1027FE00B900FF30F72B8030370203180B2CFF3057\n" +
        ":10280E00B901BA003808132CAB3037020318152C57\n" +
        ":10281E00B9013808BA00FF30BB00212CD530370281\n" +
        ":10282E0003181D2C3808B900BA01122CFF30B9005C\n" +
        ":10283E00BA01092C31088600320887003908810058\n" +
        ":10284E003A08B3003108013E432791313B08B300EB\n" +
        ":10285E003108023E43270800AE000830AF00B00139\n" +
        ":10286E002E08AD000730AD36890B3A2C30352D04CD\n" +
        ":10287E00B000AE352C083002031C472C2C08B002D9\n" +
        ":10288E00AF0B372C3008080000308B1B01302000B6\n" +
        ":10289E00BD008B130E17AC01AC0AAD012826913189\n" +
        ":1028AE00FF30AC000030AA259131F1249131200087\n" +
        ":1028BE00BC00BE01BE0AFF30AC000030AA2591312B\n" +
        ":1028CE0020003C08B6003E087924913120000430E7\n" +
        ":1028DE00BE0A3E02031C622C3D1C772C8B1708008F\n" +
        ":1028EE008B130800BB00523E860087010108003A98\n" +
        ":1028FE000319CE2C013A0319B72C033A0319AB2C4A\n" +
        ":10290E00013A03198C2CCE2C08003B08553E86004C\n" +
        ":10291E00870101143B08AE00B12791316F2691312A\n" +
        ":10292E00F124913129279131B90080303902031DEC\n" +
        ":10293E00A22C3A083702031C080020003B08523E26\n" +
        ":10294E0086008701810108003B08553E86008701FD\n" +
        ":10295E0081173B08AE00B127913174269131C22CFC\n" +
        ":10296E003B08553E8600870101173B08AE00B12794\n" +
        ":10297E0091316A269131F124913129279131803C90\n" +
        ":10298E00031DCB2C37083A0203180800A42C3B0871\n" +
        ":10299E00C127913196279131AA259131F124913198\n" +
        ":1029AE0029279131B90080303902031DE02C3A08F5\n" +
        ":1029BE0037020318080020003B08553E86008701A9\n" +
        ":1029CE00810196279131AA25913120003608B00059\n" +
        ":1029DE003B08062D21008E1723008E176030210034\n" +
        ":1029EE009E0025309D002000AC01AC0AAD012826CA\n" +
        ":1029FE00913121009D149D18022D1C080800B50070\n" +
        ":102A0E00C127913166279131AA259131F124913157\n" +
        ":102A1E002000B4003008153EB1000030031801301C\n" +
        ":102A2E00B200803A803C031D1E2D31083402031C77\n" +
        ":102A3E000800200034083007B100B201B20D320D8B\n" +
        ":102A4E00B20CB10C3108B300BB279131810A3508A5\n" +
        ":102A5E00B62791310319A52D66279131AA259131FB\n" +
        ":102A6E00F124913120003302031C7F2D9A2D35085D\n" +
        ":102A7E00523E86000330870181002100C401C40A42\n" +
        ":102A8E0020003508FF3E45239131952D3508523EE5\n" +
        ":102A9E0086000530870181002100C201C20A952DF2\n" +
        ":102AAE003508523E86000430870181002100C101A5\n" +
        ":102ABE00C10A952D3508523E8600063087018100E9\n" +
        ":102ACE002100C501C50A952D3508523E86008701A5\n" +
        ":102ADE008101810A2100C301C30A952D3508523E9A\n" +
        ":102AEE0086000230870181002100C601C60A952D9D\n" +
        ":102AFE003508B6279131013A03193E2D033A0319D1\n" +
        ":102B0E004D2D0A3A0319572D183A0319612D503AD3\n" +
        ":102B1E0003196B2DC03A0319752D952D200035081C\n" +
        ":102B2E0045239131A52D3508553E86008701350880\n" +
        ":102B3E00553E84008501003581002E2DBB27913135\n" +
        ":102B4E0066279131AA2DAD00342791312D0824002E\n" +
        ":102B5E00910020009119C02DB02D8C168C12CE2D07\n" +
        ":102B6E008E158E11CE2D0E150E11CE2D9D27913157\n" +
        ":102B7E00CE2D2C08013A0319B42D033A0319B72DA3\n" +
        ":102B8E00013A0319BA2DFC3A0319BD2DCE2D24009E\n" +
        ":102B9E0095120800B2000630AC0031083324913192\n" +
        ":102BAE00013EB40000308B1B0130B3008B13B60115\n" +
        ":102BBE00B501B21FEE2D31083C26913120003608AA\n" +
        ":102BCE00031DEB2D0130EC2D0030B600F12D340835\n" +
        ":102BDE003C269131E527913128269131FF3043264D\n" +
        ":102BEE009131E027913128269131B2351327913159\n" +
        ":102BFE0020000830B50A3502031CE02D36080319F3\n" +
        ":102C0E00142E31083C26913120003608031D112E5A\n" +
        ":102C1E000130122E0030B600172E34083C269131AA\n" +
        ":102C2E00E527913128269131FF3043269131E02757\n" +
        ":102C3E00913128269131331C262E8B1708008B13C9\n" +
        ":102C4E0008002C082D0403190800CA30AE0001300C\n" +
        ":102C5E00AF00AE020030AF3B2E082F040130031D33\n" +
        ":102C6E00302EAC020030AD3B282EAD008C318124CD\n" +
        ":102C7E00913120002D08432E2000AC00003A03199C\n" +
        ":102C8E00612E013A0319622E033A0319642E013A9A\n" +
        ":102C9E000319652E073A0319662E013A0319682E99\n" +
        ":102CAE00FA3A03195C2E692E080021008D132000BC\n" +
        ":102CBE008D13AB2F5D2F2100752F7D2F542F2100EB\n" +
        ":102CCE006D2F842FC72FAF002E08AC002F08AA2D12\n" +
        ":102CDE00AF002E08AC002F08AA2DAF002E08AC00B6\n" +
        ":102CEE002F08AA2DB000803A7F3E300803188D2E93\n" +
        ":102CFE00AC00AD01AC1BAD03AC09AD09AC0A0319B8\n" +
        ":102D0E00AD0A2C08AE002D08AF00912EAE00AF011B\n" +
        ":102D1E00AE1BAF032E08080041302000AF00C630B6\n" +
        ":102D2E00AE004E30AD006D30AC006308B3006208EB\n" +
        ":102D3E00B2006108B1006008B0008F312B272F0858\n" +
        ":102D4E00E3002E08E2002D08E1002C08E0003930E7\n" +
        ":102D5E00E0073030E13D0030E23DE33D6308B9006D\n" +
        ":102D6E006208B800B9130800FF30C400D12E430822\n" +
        ":102D7E00BA004208B900C730BB008D3146259131EB\n" +
        ":102D8E008E31F82EC401DF2EC401C40ADF2E0230AC\n" +
        ":102D9E00C400DF2E4F08003A0319BE2E013A031964\n" +
        ":102DAE00C92E033A0319CB2E013A0319CE2EDF2E6C\n" +
        ":102DBE008E31F82691314408533E86000230870149\n" +
        ":102DCE0001060319FB2E4408533E8600043001060B\n" +
        ":102DDE000319FB2E4408D62791310319FB2E440804\n" +
        ":102DEE00D1279131031D072F4308B0004208AF00D1\n" +
        ":102DFE000630AC004408D223CD3EB1008F318A2F6D\n" +
        ":102E0E004308BA004208B9000630AC004408D22389\n" +
        ":102E1E00CD3EBB008D31462D64000800F727913161\n" +
        ":102E2E0023008C018D018E01EF278F31C027C30146\n" +
        ":102E3E00C401C101C601C501C20108002000B700CE\n" +
        ":102E4E00B101D12D2000BA003608153EB700003072\n" +
        ":102E5E0003180130B800803A080021008C120D13BF\n" +
        ":102E6E0073308E0520008E053030240095009417A7\n" +
        ":102E7E001413200091110800B4000030323DB5004B\n" +
        ":102E8E003408860035088700330881000800840A5C\n" +
        ":102E9E000319850A20000008080021008D13200068\n" +
        ":102EAE008D1321000E1220000E16080021008D1326\n" +
        ":102EBE0020008D1721000E1220000E12080035087A\n" +
        ":102ECE00AC003508553E8600010808008D13200021\n" +
        ":102EDE008D1321008E1220008E1608008D132000F7\n" +
        ":102EEE008D1721008E1220008E120800E73021006F\n" +
        ":102EFE008E0520008E120E160800E73021008E057A\n" +
        ":102F0E0020008E160E120800200000082200AF00CE\n" +
        ":102F1E00840A0800200000082200AE0008003B08CA\n" +
        ":102F2E00AC003B08553E8600010808008C168C123A\n" +
        ":102F3E000C308E04F3308E050800F03086002230FF\n" +
        ":102F4E008700413101080800CF3021008E05200096\n" +
        ":102F5E008E0508003B08553E860001080800553EC8\n" +
        ":102F6E0086008701010808003508553E8600870156\n" +
        ":102F7E0081010800553E8600FF3087018100080060\n" +
        ":102F8E00183021008E040E1608002100BC001830E7\n" +
        ":102F9E00BD000800533E8600053001060800533E72\n" +
        ":102FAE0086000630010608002000BA0022002E0816\n" +
        ":102FBE00080019302000AC00AD0108004B30200095\n" +
        ":102FCE00AC00AD0108000508B2000408B10008000D\n" +
        ":102FDE0021008D160E1320000E1724008C110800F0\n" +
        ":102FEE003C30210099041908FC39023899009913D4\n" +
        ":022FFE000800C9\n" +
        ":00000001FF\n" +

        "";

	function latestFirmware() {
        var deferred = $q.defer();
        deferred.resolve(latestFirmwareEmbedded);
        return deferred.promise;
	}

    return {
        'getLatestFirmware':   latestFirmware
    };

}]);
