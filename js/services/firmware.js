// firmware.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('LinkitzFirmware',
    ['$q',
    '$rootScope',
    'LogService',
    function($q, $rootScope, LogService) {

    var latestFirmwareEmbedded =
        ":041208008A31562AA7\n" +
        ":101210007E1489312000111C1629CE3097008D31A3\n" +
        ":10122000C0258931CE01CE0A1110542A0B1D542A33\n" +
        ":10123000613095005908AF000330AF055908AE0082\n" +
        ":10124000FC30AE0503302F0206300318392AF000B7\n" +
        ":101250002F0890312A208931AD00CA3E86008701CF\n" +
        ":1012600001082E0203183629013037290030A70063\n" +
        ":101270002D08CB3E8600870101082E020318422963\n" +
        ":10128000013043290030A9002D08CC3E860087019B\n" +
        ":1012900001082E0203184E2901304F290030AB00FF\n" +
        ":1012A0002D08CD3E8600870101082E0203185A2919\n" +
        ":1012B00001305B290030A8002D08CE3E8600870152\n" +
        ":1012C00001082E0203186629013067290030AA00A0\n" +
        ":1012D0002D08CF3E8600870101082E0203187229CF\n" +
        ":1012E000013073290030AC00E5292F08543E8600F8\n" +
        ":1012F000870128080112031D01162F08543E86009D\n" +
        ":1013000027080110031D011494292F08543E86005C\n" +
        ":10131000870128080112031D01162F08543E86007C\n" +
        ":1013200027080113031D01172F08543E86002908C2\n" +
        ":101330008110031D81142F08543E86002A08811154\n" +
        ":10134000031D81152F08543E86002C080111031D32\n" +
        ":1013500001152F08543E86002B088112031D8116AB\n" +
        ":10136000F429A401A40A2708031DBA292808031D8B\n" +
        ":10137000BA29A4012F08543E8600870124080110D1\n" +
        ":10138000031D0114A501A50A2908031DCB292A085C\n" +
        ":10139000031DCB29A5012F08543E8600870125088F\n" +
        ":1013A0008110031D8114A601A60A2B08031DDC2948\n" +
        ":1013B0002C08031DDC29A6012F08543E8600870156\n" +
        ":1013C00026080111031D0115F4292F08513E86003E\n" +
        ":1013D00087010108013A03197529033A0319B12954\n" +
        ":1013E000013A03198529F4292F08013E8E318726F9\n" +
        ":1013F00089314C2A5D0803191B2A5A0890319B2019\n" +
        ":1014000089312000DD035E0803190C2A5C08903145\n" +
        ":10141000BF2089312000DE035B0F122AFF30A000BD\n" +
        ":10142000A101182A5B08A000A101A00A0319A10AC2\n" +
        ":101430002008DB003C2AFF309031BF20893120009A\n" +
        ":101440000530DA0A5A0603192C2A5A08A200A30109\n" +
        ":10145000A20A0319A30A2E2AA201A3012208DC0072\n" +
        ":101460005E08DD005C08C43E860087010108DE00DE\n" +
        ":1014700006305A02031CFA2906305A06031D4C2A6C\n" +
        ":101480003F305B02031C4B2ADB01DA0121004508D7\n" +
        ":101490002000DE004C2ADB0AFE305906031D522ACA\n" +
        ":1014A000D001D00AD90A0B117E10090091311629FA\n" +
        ":1014B0009631F1268A313C082100A300A530200096\n" +
        ":1014C000B6000030B700210023086D228A31A53014\n" +
        ":1014D0002100A0000030A100CE2A2000BC00553021\n" +
        ":1014E000B0003C08CA248A31D63EB0248A31BB0001\n" +
        ":1014F000B000FA30B101B200FF30B300D9238A3115\n" +
        ":101500003008FF3EB8000030313DB900390DB90C4C\n" +
        ":10151000B80C3808BD002B303C020318952A7F30E8\n" +
        ":10152000BE003D08BF00C001BC2A55303C02031874\n" +
        ":101530009D2A3D08BE007F30922A80303C0203186D\n" +
        ":10154000A62A7F30BE01BF003D08AE2AAB303C0268\n" +
        ":101550000318B02ABE013D08BF007F30C000BC2A7E\n" +
        ":10156000D5303C020318B82A3D08BE00BF01AD2AA1\n" +
        ":101570007F30BE00BF01A42A3608860037088700E6\n" +
        ":101580003E0881003F08B8003608013E3D258A31FB\n" +
        ":101590004008B8003608023E3D250800E22A210036\n" +
        ":1015A00077258A31C430BF0016248A31E22C21000D\n" +
        ":1015B000A201F12A2100A201A20AF12A023021008F\n" +
        ":1015C000A200F12A20005808003A0319CF2A013A54\n" +
        ":1015D0000319D72A033A0319DA2A013A0319DE2A32\n" +
        ":1015E000F12AE2248A31210022088F258A31031D45\n" +
        ":1015F0000B2B31258A3175238A31CA3EB800B901D7\n" +
        ":10160000EE238A31210031258A3175238A31CD3E7E\n" +
        ":10161000B800B901EE2B77258A310630B0002100E1\n" +
        ":10162000220875238A31CA3EBF00162C7F258A31D5\n" +
        ":10163000A430BF0016248A312100BC013C088F254C\n" +
        ":101640008A31031D452B19258A31D9238A31292551\n" +
        ":101650008A3109258A3175238A31063EA43EB800B5\n" +
        ":10166000B901EE238A31210019258A31D9238A3123\n" +
        ":1016700029258A3109258A3175238A31093EA43EFC\n" +
        ":10168000B800B901EE238A31692B7F258A31210008\n" +
        ":101690003C082000B0000330B101B200B301D923EF\n" +
        ":1016A0008A3129258A3122082000BD07210023081C\n" +
        ":1016B0002000BE3D0330BD070318BE0A0630B0004F\n" +
        ":1016C00021003C0875238A31063EA43EBF00162443\n" +
        ":1016D0008A3121000330BC0A3C02031C1E2BA430BB\n" +
        ":1016E0002000B5000030B600F22C2000B200B1019D\n" +
        ":1016F00030083218B107B035B2363208031D782BE6\n" +
        ":1017000031080800C500023E68258A31B01BB103CC\n" +
        ":101710005730B200B301D9238A313108C4003008F0\n" +
        ":10172000C300450A68258A31B01BB1033D30B200C1\n" +
        ":10173000B301D9238A313108C0003008BF00450801\n" +
        ":1017400068258A31B01BB1036A30B200B301D923D6\n" +
        ":101750008A313108C2003008C100450A68258A3143\n" +
        ":10176000B01BB1038530B200FF30B300D9238A31FA\n" +
        ":1017700043083007B8004408313DB900BA003608C4\n" +
        ":101780008600370887003A0881003F084107B80003\n" +
        ":101790004008423D5E258A31013E53258A31410889\n" +
        ":1017A0003F02B8004208403B5E258A31023E532585\n" +
        ":1017B0000800B401B501301CE12B3208B40733082E\n" +
        ":1017C000B53DB235B30DB136B00C30083104031D50\n" +
        ":1017D000DB2B3508B1003408B0000800360886005D\n" +
        ":1017E000370887000108B0248A31BA00380886001B\n" +
        ":1017F000390887003A0881003608860037088700D4\n" +
        ":1018000041310108B0248A31BA003808013E482528\n" +
        ":101810008A31360886003708870042310108B02433\n" +
        ":101820008A31BA003808023E482508003E08B70051\n" +
        ":101830003D08B6003E08B9003D08B800EE238A31E5\n" +
        ":101840008B13CC010330B0004C08013ECA248A310E\n" +
        ":10185000CB000330B0004C08023ECA248A31CA00D3\n" +
        ":101860004B086E258A31031D3A2C4A086E258A31B1\n" +
        ":101870000319782C95258A314B0887258A31000871\n" +
        ":10188000C3004A08C400C5013D07840045083E3D29\n" +
        ":10189000850043080007B600B7010318B70AC31B49\n" +
        ":1018A000B703801BB70320004C08C600C7013D07E3\n" +
        ":1018B000840047083E3D85000008B000B101B01B20\n" +
        ":1018C000B1034B08C800C9013D07840049083E3DEB\n" +
        ":1018D00085000008B200B301B21BB303D9238A31DB\n" +
        ":1018E0003108B9003008B8009B258A3136087E2CB3\n" +
        ":1018F00095258A314C0887258A31003781004C08AC\n" +
        ":101900003F07C000033E860087014C083F07C10027\n" +
        ":10191000840085010008C2004C08C300C4013D07D3\n" +
        ":10192000840044083E3D85000008C5004208450289\n" +
        ":1019300081000330CC0A4C02031C222C3F08860095\n" +
        ":10194000443FCC003F08043E86003F0A84008501E6\n" +
        ":10195000000881003F0A86004C0881008B170800B0\n" +
        ":10196000B400803A7F3E34080318C42CB000B101A3\n" +
        ":10197000B01BB103B009B109B00A0319B10A3008AC\n" +
        ":10198000B2003108B300C82CB200B301B21BB303DC\n" +
        ":1019900032080800B2000830B300B4013208B100C8\n" +
        ":1019A0000730B136890BD12C34353104B400B2354F\n" +
        ":1019B00030083402031CDE2C3008B402B30BCE2CEA\n" +
        ":1019C000340808009631F1268A313C08D8000330EB\n" +
        ":1019D000D8055808031908008E31B7268A31031D2F\n" +
        ":1019E0000800E22CB9013908C43E86008701390895\n" +
        ":1019F000B700B801350784003808363D8500000877\n" +
        ":101A0000B0248A3181001830B90A3902031808005D\n" +
        ":101A1000F32C22082000B607210023082000B73D40\n" +
        ":101A20000330B6070318B70A0630B00021003C089F\n" +
        ":101A3000080021082000B700210020082000B6007F\n" +
        ":101A400021003C082000B0000330B101B200B30116\n" +
        ":101A5000080030082100A200200031082100A30066\n" +
        ":101A6000080021082000B700210020082000B6004F\n" +
        ":101A70000630B000210022080800B9000030373DD0\n" +
        ":101A8000BA00390886003A08870038088100080043\n" +
        ":101A9000BB000030393DBC003B0886003C08870095\n" +
        ":101AA0003A0881000800BD000030373DBE003D0807\n" +
        ":101AB00086003E0887003C0881000800B900430802\n" +
        ":101AC0003807BA004408393DBB00BC00360808009E\n" +
        ":101AD000860087010108B000B1010800C000C10103\n" +
        ":101AE0003D07860041083E3D8700010808002108A7\n" +
        ":101AF0002000BE00210020082000BD0008002108B1\n" +
        ":101B00002000BE00210020082000BD000800C10008\n" +
        ":101B1000C2013D07840042083E3D85000800513E59\n" +
        ":101B2000860002308701010608004C083F07C0000C\n" +
        ":101B3000860087010800BB01BC0136083704031981\n" +
        ":101B4000BB2DBA01BA0AB71BA82DB635B70DA22D09\n" +
        ":101B5000BB35BC0D37083902031DB02D36083802DD\n" +
        ":101B6000031CB72D3608B8023708B93B3B14B7360B\n" +
        ":101B7000B60CBA0BA82D3C08B7003B08B60008000D\n" +
        ":101B8000D3258D31003A0319C92D17268D3118261A\n" +
        ":101B90008D31640020005708031D08001A305F02D1\n" +
        ":101BA00003180800A22E0030F701F70A8B1B013042\n" +
        ":101BB000F5008B1317268D31F601F82D643076026F\n" +
        ":101BC0000318FB2D21000E1020000E10F001F00A6A\n" +
        ":101BD000F10103268D3121000E14F001F00AF1010C\n" +
        ":101BE00003268D31003020000E180130F700F60A70\n" +
        ":101BF0007708031DDE2D1C267508031D8B1703199E\n" +
        ":101C00008B13770808007008710403190800CA30A4\n" +
        ":101C1000F2000130F300F2020030F33B720873046B\n" +
        ":101C20000130031D0B2EF0020030F13B032E8F2EEE\n" +
        ":101C30009D2680311C280800FF30F0000030262649\n" +
        ":101C40008D318C164C308E0477260800F1009731C8\n" +
        ":101C500044278D31710824009100F201652E031094\n" +
        ":101C600020008C1E0314031C382E20008C16602EBE\n" +
        ":101C700020008C12602E031020008E1D0314031C04\n" +
        ":101C8000442E20008E15602E20008E11602E031031\n" +
        ":101C900020000E1D0314031C502E20000E15602E74\n" +
        ":101CA00020000E11602E031020008C1E0314031C54\n" +
        ":101CB0005C2E20008C165E2E20008C120C308E06BE\n" +
        ":101CC0000230F20A72020318742E7008013A0319E6\n" +
        ":101CD0002F2E033A03193B2E013A0319472EFC3AE3\n" +
        ":101CE0000319532E602E602E20008E130800F4017D\n" +
        ":101CF000F40A7408B7268D310319812E74088726DB\n" +
        ":101D00008D310430F40A740203180800792EF300B0\n" +
        ":101D1000F000730897317E278D31262608002100B8\n" +
        ":101D20000D138E130E1320000D138C122400951228\n" +
        ":101D3000333020008E050D1308008B130E17210081\n" +
        ":101D40000E1308007F30D700DF0A0800B401B40A80\n" +
        ":101D50003408B7268D310319B12E34089331A423EA\n" +
        ":101D60008D310430B40A340203180800A82E503E06\n" +
        ":101D70008600870101080800C0005B278E31C10082\n" +
        ":101D80004108031908008B13232706302000B000F8\n" +
        ":101D9000B1019331AB238E314108B1002930EC26DB\n" +
        ":101DA0008E312000BF0040089D278E312B30EC265D\n" +
        ":101DB0008E312000BF00400A9D278E312D30EC2649\n" +
        ":101DC0002000BF004008023E860087013F088100D6\n" +
        ":101DD0008B174108D8000800B20024009516200097\n" +
        ":101DE000310808278E319111320880382400910083\n" +
        ":101DF0002000911DF82E91113108533EA4278E31F9\n" +
        ":101E00002000911D002F31084027240011080800F0\n" +
        ":101E1000B000142F8C1208008E1108000E1108005B\n" +
        ":101E20008C12F3308E0508003008013A03190A2F8E\n" +
        ":101E3000033A03190C2F013A03190E2FFC3A031928\n" +
        ":101E4000102F222F0800BE00B40021000D16200024\n" +
        ":101E50003408533E8600870101133408533E860040\n" +
        ":101E6000811534089331A4238E31340840278E31F4\n" +
        ":101E70002400941714133030950020003E086D2F75\n" +
        ":101E8000B0004C2F8C1608008E1508000E150800A7\n" +
        ":101E90008C160C308E0408003008013A0319422FCA\n" +
        ":101EA000033A0319442F013A0319462FFC3A031948\n" +
        ":101EB000482F5A2F0800B001B00A3008503E860063\n" +
        ":101EC000023087010106031D672F30080800043027\n" +
        ":101ED000B00A3002031800345D2FBC003730860092\n" +
        ":101EE0000130870032308400003085000A30B100B4\n" +
        ":101EF00016001A00B10B782F3C08533E860087016C\n" +
        ":101F00000108BB002400951620003C0808278E31EC\n" +
        ":101F1000911D882FBD0191113D08323EA4278E31BD\n" +
        ":101F20002000911D902F0A30BD0A3D02031C8B2F0B\n" +
        ":101F30003C084027240095120800860087013F08CE\n" +
        ":101F400081004108B10008008600870101082400D3\n" +
        ":101F5000910008002000B400B201B01FB32FB009F7\n" +
        ":101F6000B00AB201B20AB41FB92F0130B409B40AE1\n" +
        ":101F7000B206B30130080319CE2FB101B10AB01B6C\n" +
        ":101F8000C32FB035BE2FB33530083402031CCB2F1E\n" +
        ":101F90003008B4023314B036B10BC32F3208031922\n" +
        ":101FA000D32FB309B30A330808002000B300B201ED\n" +
        ":101FB000B31FDE2FB309B30AB201B20AB01FE22F7A\n" +
        ":101FC000B009B00A30080319F42FB101B10AB01BEF\n" +
        ":101FD000EB2FB035E62F30083302031CF12F300809\n" +
        ":101FE000B302B036B10BEB2F32080319F92FB30946\n" +
        ":061FF000B30A33080800EB\n" +
        ":102000009331ED2B9331F22B9331F52B9331F82B48\n" +
        ":102010009331FB2B9431042C94315D2C9431152C8D\n" +
        ":102020009431212C9431232C94312B2C9431372C46\n" +
        ":102030009431472C94310D2C9031A2289031A52851\n" +
        ":102040009031A8289031AB289031AE289031B1283A\n" +
        ":10205400F200F10170087218F107F035F2367208D7\n" +
        ":10206400031D2C287108080064000130800101312F\n" +
        ":10207400FE020030FF3B7F087E040319003437283A\n" +
        ":1020840020005708031908009631F12690313D08C5\n" +
        ":10209400803ABE0080303E02031D522881303C024B\n" +
        ":1020A400031C08002000D70308002000C600150800\n" +
        ":1020B400C000C1014608C200C3019631F126903127\n" +
        ":1020C40042083C07C40043083D3DC500400844079E\n" +
        ":1020D400BE004108453DBF006F283E08F8003F0898\n" +
        ":1020E400F900FA01FB010800B801B901BA01BB010A\n" +
        ":1020F400301C84283408B8073508B93D3608BA3D81\n" +
        ":102104003708BB3DB435B50DB60DB70DB336B20CBB\n" +
        ":10211400B10CB00C3308320431043004031D7A28A6\n" +
        ":102124003B08B3003A08B2003908B1003808B000DF\n" +
        ":102134000800F100A02090317108BF28F000B428F5\n" +
        ":1021440021008E16080021000E16080021008D17AC\n" +
        ":10215400080021008E16080021000E160800210038\n" +
        ":102164008D17080070088400063004020318080064\n" +
        ":10217400903104351C3E82000800F000F228210052\n" +
        ":102184008D1320008D13CF3021008E0520008E0585\n" +
        ":10219400080010210E1220000E12080010218E12C9\n" +
        ":1021A40020008E120800E73021008E0520008E12D8\n" +
        ":1021B4000E1608000A210E1220000E1608000A212D\n" +
        ":1021C4008E1220008E160800E73021008E052000B4\n" +
        ":1021D4008E160E120800183021008E040E16080008\n" +
        ":1021E4007008003A0319CB28013A0319D028033A9E\n" +
        ":1021F4000319D528013A0319DC28073A0319E12801\n" +
        ":10220400013A0319E628FA3A0319C128ED2808000F\n" +
        ":1022140021008D1320008D132100080021008D134F\n" +
        ":1022240020008D1721000800F03084002130850043\n" +
        ":102234000230FE01FF009031362091314D30FC0117\n" +
        ":102244008400003085001230FE00FF0190313620FA\n" +
        ":102254009131C3308400003085001930FE00FF0145\n" +
        ":102264009031362091310130F800F901FA01FB0177\n" +
        ":1022740022006030B7004730B800B901BA01BB0191\n" +
        ":10228400BC01BD01BE01BF01C0017E1020004A296E\n" +
        ":102294003C30210099041908FC390238990099133B\n" +
        ":1022A40023008C018D018E0121008D160E13200058\n" +
        ":1022B4000E1724008C11C030210095055A302000DF\n" +
        ":1022C4009500C130990001309800CE30970021006C\n" +
        ":1022D40011140B08E038EF398B00F0308600213000\n" +
        ":1022E400870044318101F03086002130870043317A\n" +
        ":1022F4008101F030860021308700453181012000C2\n" +
        ":10230400D101D201D3011C302100970014302000E8\n" +
        ":10231400DF00C22391312100A901A90AEF219131E3\n" +
        ":10232400A90A2908031D902998299029C2239131CB\n" +
        ":10233400EF219131B52791310630CC239131E12938\n" +
        ":10234400EF21913120000030CE01BF2391310330C1\n" +
        ":10235400CC2391312100C201E129D001B001B00A9E\n" +
        ":10236400B1013108C43E8600870101080319D72949\n" +
        ":10237400BC29D7293108C43E860087013108C43EF0\n" +
        ":10238400840085010036810080305702031CD62961\n" +
        ":10239400CC29D6293108C43E860087013108C43EC1\n" +
        ":1023A4008400850100368107B001B10A183031027A\n" +
        ":1023B400031CB329DE29B32930082100C200200000\n" +
        ":1023C4004E08031DA2295008031DAF29210042080D\n" +
        ":1023D4000319E12997279131E1298B13882791313A\n" +
        ":1023E400AB2391317F239131A700A801A80A2708C4\n" +
        ":1023F400A0002808072291312100A7000430A80A70\n" +
        ":102404002802031CF9298B170800A6008E31B72671\n" +
        ":102414009131003A0319362A013A03192C2A033A56\n" +
        ":102424000319222A013A0319182A362A61279131FD\n" +
        ":10243400011C03143B2791310110031D0114732A5D\n" +
        ":1024440061279131811F03143B2791318113031DAF\n" +
        ":102454008117732A61279131011F03143B2791319E\n" +
        ":102464000113031D0117732A2608533E8600FF300B\n" +
        ":10247400870181062608A42391317F239131A4008A\n" +
        ":1024840019279131803C031D492A21082402031C89\n" +
        ":10249400552A210019279131803C031D532A210814\n" +
        ":1024A4002002031C6D2A210023279131A3008030D0\n" +
        ":1024B4002302031D5F2A24082102031C732A21001E\n" +
        ":1024C40023279131A30080302302031D6B2A2008A7\n" +
        ":1024D40021020318732AFF302000D70021002608A8\n" +
        ":1024E400DF2A21002608A42391317F239131A400FF\n" +
        ":1024F40025080319922A19279131803C031D842A47\n" +
        ":1025040021082402031CA92A210019279131A300C0\n" +
        ":1025140080302302031D902A20082102031CA92ACB\n" +
        ":1025240021002508031D9F2A23279131803C031D88\n" +
        ":102534009D2A210824020318A92A21002327913166\n" +
        ":10254400803C031DA72A210820020318DC2A20004E\n" +
        ":10255400580821002606031DB22A8C31E224913149\n" +
        ":102564005727913144312100A100260ABA2AA13506\n" +
        ":10257400890BB92A2108FF3A810557279131453142\n" +
        ":10258400A100260AC62AA135890BC52A2108FF3ACB\n" +
        ":102594008105572791314331A100260AD22AA1355A\n" +
        ":1025A400890BD12A2108FF3A81052608503E86006E\n" +
        ":1025B400870181012100240808002000CC00533E3B\n" +
        ":1025C4008600FF30870181004C08A42391317F23CA\n" +
        ":1025D40091312000CA004C08533E8D279131A42329\n" +
        ":1025E40091317F2391312000CB00153EC70000308C\n" +
        ":1025F40003180130C800803A803C031D032B4708B0\n" +
        ":102604004A020318082B20004B08080020004A083F\n" +
        ":102614004B07C700C801C80D480DC80CC70C4708B4\n" +
        ":10262400C9004C08533E86008030870181004C0865\n" +
        ":102634007E2791310319782B4C08A42391317F23F1\n" +
        ":10264400913120004902031C5D2B6E2B4C08503E37\n" +
        ":102654008600033087018100572791314431C70038\n" +
        ":102664004C0A352BC735890B342B5A2B4C08503E5A\n" +
        ":102674008600F03087018101810A860021308700BD\n" +
        ":1026840001304331C7004C0A482BC735890B472B0F\n" +
        ":102694005A2B4C08503E8600023087018100572790\n" +
        ":1026A40091314531C7004C0A582BC735890B572B3C\n" +
        ":1026B400470881046A2B4C087E279131013A03199B\n" +
        ":1026C400282B413A0319382BC03A03194B2B6A2B98\n" +
        ":1026D4004C08BF239131782B4C08533E8600870168\n" +
        ":1026E4004C08533E840085010036182B4C08533E99\n" +
        ":1026F4008D279131A42391317F2B24009512200042\n" +
        ":102704008E13B001B00AB101AB23913121008E17B1\n" +
        ":1027140023008E17603021009E0025309D008827FD\n" +
        ":102724009131AB23913121009D149D18972B2300E7\n" +
        ":102734008E1321008E131B081C0790315720210093\n" +
        ":102744001C0808002000B300B00033087E27913134\n" +
        ":10275400A52E3008310403190800CA30B200013034\n" +
        ":10276400B300B2020030B33B320833040130031D1E\n" +
        ":10277400B32BB0020030B13BAB2BB000D800080043\n" +
        ":10278400FF302000B0000030A5268C164C308E049B\n" +
        ":102794008E31A62E2200A000840098308500FF30E0\n" +
        ":1027A4002100C300EA2D200000082D2691312200CB\n" +
        ":1027B400B600840A0319850A200000082D269131E9\n" +
        ":1027C4002200B5002D279131B300840A0319850A2C\n" +
        ":1027D40092279131502C3608AF003508AF055D2C97\n" +
        ":1027E400360835044E2C360835074E2C350836028B\n" +
        ":1027F4004E2C35082000B000220036088B3175239A\n" +
        ":102804009131452C35082000B000220036088F3164\n" +
        ":10281400AA279131452C35082000B0002200360843\n" +
        ":102824008F31D52791312200A701360803191F2CB7\n" +
        ":10283400350803191F2CA701A70A27084E2C3608B0\n" +
        ":10284400292C3608031D282C0130292C003035068C\n" +
        ":102854004E2C3608803A2100BF0022003508803A09\n" +
        ":102864002100BF02031C422C442C3508803A21006D\n" +
        ":10287400BF0022003608803A2100BF02031C442C0A\n" +
        ":102884000130452C003022004E2C36083506031D3D\n" +
        ":102894004D2C01304E2C0030AF005D2C2D08F03E45\n" +
        ":1028A400031C5D2C84000E30040203185D2C90314F\n" +
        ":1028B4000435003E82002F082000BE0022003308A9\n" +
        ":1028C4004D2691312200310885003008812C0230D8\n" +
        ":1028D40084070318850A050895269131040895266E\n" +
        ":1028E4009131023084020030853B20000008220030\n" +
        ":1028F400A3002D279131A400230885002408840017\n" +
        ":10290400EA2D512791310319850A20000008BE00E1\n" +
        ":10291400220033084D269131840A0319850AEA2DD1\n" +
        ":10292400200000082200A1002D279131B400840A60\n" +
        ":102934000319850AC72C79279131A8002930200072\n" +
        ":10294400B6000130B700220034082D268A316D22EA\n" +
        ":10295400913128302100BD000130BE005B26913149\n" +
        ":10296400642C0508B1000408B00034082D26913108\n" +
        ":10297400B0003008DF00642C92279131F1269131A8\n" +
        ":102984003C08BE0022003408622C2108003A0319D6\n" +
        ":102994002C2E013A0319B32C033A03199D2C013A46\n" +
        ":1029A4000319BE2CEA2D200000082200A200840A8C\n" +
        ":1029B4000319850A182D79272100C302F13020005C\n" +
        ":1029C400C6002130C700210043082000C6070318B1\n" +
        ":1029D400C70A48308E31BC2691314708B7004608F3\n" +
        ":1029E400B60048308B318223913103303A2691313D\n" +
        ":1029F400642C0508B1000408B0002100F030C30ABB\n" +
        ":102A0400BD002130BE004308BD070318BE0A5B2683\n" +
        ":102A140091312100430834279131C307642C8C265B\n" +
        ":102A2400913184008C2691318500EA2D2208013AE7\n" +
        ":102A34000319FB2C033A0319DD2C063A0319112D53\n" +
        ":102A44002B2E512791310319850A35269131AA2D50\n" +
        ":102A54005C279131832791312D2691313A2691318A\n" +
        ":102A6400EA2D67279131840A0319850A35269131A5\n" +
        ":102A74002200AE003208F03E2100BF002130C00128\n" +
        ":102A8400C03D3F0886004008870022002E088100D0\n" +
        ":102A94002E080319EA2DB20A35269131BF0022000F\n" +
        ":102AA4003208F03E2100C0002130C101C13D400880\n" +
        ":102AB4008600410887003F0881002200AE034A2DAA\n" +
        ":102AC40067279131840A0319850A32083427913122\n" +
        ":102AD400AE0032082E07AC0032082C02031CEA2D8B\n" +
        ":102AE4002C08342791313A26913122002C080319FD\n" +
        ":102AF400EA2DAC036E2D5C2791312D279131B30063\n" +
        ":102B0400832791312D2691312200B600B61F9D2DC9\n" +
        ":102B140036082100BF00C001BF1BC003BF09C009A4\n" +
        ":102B2400BF0A0319C00A3F082200A500210040087B\n" +
        ":102B34002200A600A22D3608A500A601A51BA60307\n" +
        ":102B44002508AA2D512791310319850A722791313D\n" +
        ":102B54002000E52D5C279131832791312D26913179\n" +
        ":102B64002100BF00F1308600213087003F0881003A\n" +
        ":102B7400EA2D722791310319EA2D033084070318D3\n" +
        ":102B8400850AEA2D672791312D279131B4002D272D\n" +
        ":102B94009131B300840A0319850A51302D06031DAF\n" +
        ":102BA400DE2D33082D269131BE00220034082D2657\n" +
        ":102BB400913122003207E82D34082D26913122006C\n" +
        ":102BC40032072D269131BE00220033084D26913163\n" +
        ":102BD400200000082200AD00840A0319850AF030A1\n" +
        ":102BE4002D052100BF00103A0319D52B22002D0812\n" +
        ":102BF400003A03192B2E053A0319922C033A0319B0\n" +
        ":102C0400D52C0E3A0319832C023A03192A2D013AC2\n" +
        ":102C14000319232D073A03197D2D013A0319332D86\n" +
        ":102C2400033A0319622D3E3A0319A42D013A0319FC\n" +
        ":102C3400AC2D713A0319BB2D103A0319C42D013A76\n" +
        ":102C44000319C42D313A0319772C013A0319692C5D\n" +
        ":102C54002B2EEA2D08002000B000300803190034A0\n" +
        ":102C64003008342708002100C30A43083427080029\n" +
        ":102C74002000B20021004308F03E2000B0002130C3\n" +
        ":102C8400B101B13D30088600310887003208810067\n" +
        ":102C94002100C30308002000C100F03EBF00213022\n" +
        ":102CA400C001C03D3F088600400887003E088100FF\n" +
        ":102CB400080090314220913121003D086C27913168\n" +
        ":102CC4007D3E0318672E8A31582A3D086C279131BE\n" +
        ":102CD4007A3E3D080318752E013EA00000303E3DAB\n" +
        ":102CE400A1008A31CE2A6C279131683E3D08031831\n" +
        ":102CF400822E013EA00000303E3DA1008B31162BF8\n" +
        ":102D0400013E2000B500003021003E3D2000B60009\n" +
        ":102D14008C31F22CFC0A7C08F03E860022308701BC\n" +
        ":102D2400873D010808002000B2007C08F03EB00096\n" +
        ":102D34002230B101B13D30088600310887003208E5\n" +
        ":102D44008100FC030800B1004427913131082400BC\n" +
        ":102D540091002000B201E02E03108C1E0314031C0A\n" +
        ":102D6400B62E20008C16DB2E20008C12DB2E0310D6\n" +
        ":102D74008E1D0314031CC12E20008E15DB2E200093\n" +
        ":102D84008E11DB2E03100E1D0314031CCC2E200009\n" +
        ":102D94000E15DB2E20000E11DB2E03108C1E0314E7\n" +
        ":102DA400031CD72E20008C16D92E20008C120C3038\n" +
        ":102DB4008E060230B20A32020318EF2E3008013AAE\n" +
        ":102DC4000319AE2E033A0319B92E013A0319C42E7E\n" +
        ":102DD400FC3A0319CF2EDB2EDB2E8E130800413074\n" +
        ":102DE4002000B300C630B2004E30B1006D30B000E8\n" +
        ":102DF4007B08B7007A08B6007908B5007808B400F3\n" +
        ":102E0400903176203308FB003208FA003108F900CB\n" +
        ":102E14003008F8003930F8073030F93D0030FA3D19\n" +
        ":102E2400FB3D7B08BD007A08BC00BD1308002008E8\n" +
        ":102E3400153EA100003003180130A2002208803A98\n" +
        ":102E440008002008EB3EA100FF3003180030A20068\n" +
        ":102E54002208803A0800840A0319850A2000000821\n" +
        ":102E640022000800F03E860021308701873D0108DA\n" +
        ":102E74000800003003180130A5002608533E8600E0\n" +
        ":102E84002508080021008C120D1373308E05303094\n" +
        ":102E940024009500941714132000911108002000B9\n" +
        ":102EA40000082200B300840A0800F03086002130B4\n" +
        ":102EB40087000134200000082200B400080026081E\n" +
        ":102EC400533E8600870103100800200000082200FA\n" +
        ":102ED400B200080086003E0887000108803A080016\n" +
        ":102EE400F0308600213087004131010808000508D0\n" +
        ":102EF400B1000408B0000334533E86008701010882\n" +
        ":102F04000800840A0319850A340808002000B00167\n" +
        ":102F1400B00AB10108008600870181014C0808004D\n" +
        ":102F24000508B1000408B000080017082000B80024\n" +
        ":102F34008B13F8279131D001D00ACE01CE0A5F0855\n" +
        ":102F44002100970011108B1263008B1621001114BD\n" +
        ":102F54002000380821009700C2239131CE30970019\n" +
        ":102F640011108B17B52FC9279131003A0319BE2FC1\n" +
        ":102F7400F8279131FA279131640020005708031D86\n" +
        ":102F840008001A305F02031808008E31A22E2000B8\n" +
        ":102F94000030B701B70A8B1B0130B5008B13F8273B\n" +
        ":102FA4009131B601ED2F643036020318F02F210061\n" +
        ":102FB4000E1020000E10B001B00AB101AB23913104\n" +
        ":102FC40021000E1488279131AB23913100300E1863\n" +
        ":102FD4000130B700B60A3708031DD52FC2233508C0\n" +
        ":102FE400031D8B1703198B13370808008E318F2E9E\n" +
        ":0C2FF4008E319D26913180311C28080090\n" +
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
