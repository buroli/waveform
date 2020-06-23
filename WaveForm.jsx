/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import Text, { InfoText } from '@/components/Text/Text';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import WaveSurfer from 'wavesurfer.js/dist/wavesurfer.min';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min';
import './waveform.scss';
import BigGradientPillButton from '@/components/Buttons/BigGradientPillButton';
import LoadingButton from '@/components/Buttons/LoadingButton';
import { Flex, Box } from '@rebass/grid';
import Pause from '@/components/Icons/Pause';
import Play from '@/components/Icons/Play';
import { HTTP } from '@/http';
import TimeInput from '@/components/Inputs/TimeInput';

const Root = styled.div`
  background-color: ${p => p.theme.colors.white};
  border: 1px solid ${p => p.theme.colors.lightGrey};
  border-radius: 3px;
  height: 100px;
  display: flex;
  align-items: center;
  position: relative;
  overflow-x: auto;
`;

const LoadingError = styled.div`
  font-size: 20px;
  color: ${p => p.theme.colors.red};
`;

const Control = styled.div`
  flex: 0 0 60px;
  display: inline-block;
  margin-left: 20px;
`;

// const Play = styled.span`
// 	width: 50px;
// 	height: 50px;
// 	border-radius: 50%;
// 	display: flex;
// 	align-items: center;
// 	justify-content: center;
// 	background: ${p => p.theme.colors.lightGrey};
// 	cursor: pointer;
// `;

const WaveForm = styled.div`
  margin-left: 10px;
  flex: 0 0 90%;
  position: relative;
`;

const Slider = styled.div`
  padding: 20px 0 0 0;
  text-align: center;
`;

const Loader = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 90px;
  width: 90%;
  height: 100%;
  color: #666f77;
  font-size: 40px;
`;

const TimelineContainer = styled.div`
  margin-left: 91px;
`;

const animationOpacity = keyframes`
  0%   { opacity:1; }
  50%  { opacity:.2; }
  100% { opacity:1; }
`;

const Decoding = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #666f77;
  font-size: 40px;
  animation: ${animationOpacity} 2s ease infinite;
`;

const StyledInfoText = styled(InfoText)`
  margin-bottom: 12px;
  color: ${p => (p.isRed ? p.theme.colors.red : 'default')};
`;

const StyledInfoTextRed = styled(InfoText)`
  color: ${p => p.theme.colors.lightRed};
  margin-bottom: 20px;
`;

const ErrorMessageContainer = styled(Box)`
  height: 16px;
  margin-bottom: 12px;
`;
// files converted to array
// const peak = [0.1705,-0.1786,0.57,-0.196,0.2469,-0.6249,0.2178,-0.2489,0.2426,-0.1827,0.3855,-0.1794,0.3346,-0.1829,0.1502,-0.2607,0.5072,-0.1119,0.2022,-0.636,0.0801,-0.3056,0.2837,-0.26,0.2868,-0.3573,0.1095,-0.3634,0.3742,-0.3614,0.3219,-0.0196,0.2802,-0.2484,0.308,-0.3372,0.0719,-0.2465,0.3727,-0.1902,0.0729,-0.2808,0.441,-0.2986,0.2626,-0.288,0.213,-0.2866,0.3811,-0.5066,0.2162,-0.2569,0.1374,-0.2746,0.1773,0,0.1676,-0.0968,0.1197,-0.1477,0.1538,-0.201,0.1681,-0.2097,0.2095,-0.2223,0.2534,-0.4827,0.1422,-0.3873,0.2446,-0.1029,0.2886,-0.1222,0.2087,-0.1477,0.1148,-0.2733,0.3435,-0.1642,0.5002,-0.1811,0.4284,-0.192,0.3085,-0.1275,0.0967,-0.304,0.3433,-0.1786,0.3711,-0.2955,0.3532,-0.2329,0.134,-0.1983,0.2292,-0.1354,0.2853,-0.3672,0.2568,-0.2004,0.1591,-0.1904,0.1938,-0.0676,0.1845,-0.1316,0.1886,-0.4636,0.5114,-0.1931,0.4598,-0.1226,0.0924,-0.1788,0.066,-0.2997,0.1383,-0.2571,0.2194,-0.2053,0.0836,-0.2963,0.0601,-0.1694,0.2953,-0.1787,0.4389,-0.4335,0.3145,-0.2787,0.5415,-0.2028,0.1975,-0.2749,0.0838,-0.2588,0.2355,-0.1963,0.0874,-0.3418,0.1458,-0.2589,0.1587,-0.1913,0.0436,-0.2971,0.0526,-0.1143,0.196,-0.0374,0.2555,-0.1774,0.0277,-0.0272,0.1722,-0.0001,0.11,-0.0367,0.1328,-0.1382,0.1435,-0.1709,0.0739,-0.1056,0.2246,-0.1524,0.3331,-0.083,0.1596,-0.0773,0.1387,-0.1805,0.0533,-0.4049,0.2144,-0.1729,0.0705,-0.149,0.3583,-0.0423,0.1821,-0.3169,0.114,-0.3542,0.0561,-0.0637,0.2174,-0.1133,0.1177,-0.104,0.0848,-0.0594,0.2044,-0.1717,0.1808,-0.0766,0.1419,-0.4293,0.073,-0.0312,0.1131,-0.1435,0.2225,-0.0605,0.1749,-0.1116,0.0751,-0.3368,0.249,-0.1461,0.0623,-0.2209,0.2359,-0.2041,0.1396,-0.2152,0.1028,-0.2437,0.0717,-0.1783,0.0596,-0.2202,0.1888,-0.0837,0.0567,-0.1199,0.3489,-0.0003,0.3395,-0.2378,0.8129,-0.1758,0.1714,-0.0545,0.2882,-0.3446,0.0422,-0.1593,0.0846,-0.2325,0.1504,-0.0367,0.0097,-0.1722,0.2727,-0.1998,0.2108,-0.1832,0.1364,-0.17,0.2214,-0.3468,0.1928,-0.1924,0.2969,-0.1928,0.2656,-0.1311,0.1711,-0.1132,0.0585,-0.3756,0.2883,-0.1095,0.0397,-0.4009,0.0813,-0.1531,0.1929,-0.2303,0.3324,-0.2941,0.2764,-0.3613,0.1915,-0.4603,0.3093,-0.0267,0.3818,-0.2011,0.206,-0.2628,0.191,-0.2858,0.2492,-0.0137,0.3559,-0.0653,0.3005,-0.0128,0.2439,-0.2617,0.129,-0.3155,0.0911,-0.1776,0.0724,-0.21,0.39,-0.1646,0.2753,-0.2882,0.2056,-0.235,0.0572,-0.1987,0.2041,-0.1522,0.1407,-0.2568,0.1429,-0.1034,0.3252,-0.1262,0.2307,-0.1258,0.4248,-0.1266,0.0535,-0.2457,0.0976,-0.1696,0.268,-0.111,0.0235,-0.216,0.1775,-0.273,0.0951,-0.2255,0.4054,-0.0829,0.1743,-0.2132,0.1313,-0.2608,0.3003,-0.2374,0.2227,-0.2674,0.2194,-0.0271,0.1732,-0.4366,0.3251,-0.0598,0.4786,-0.062,0.3654,-0.2139,0.3285,-0.1379,0.2261,-0.357,0.1126,-0.3427,0.543,-0.071,0.2969,-0.4066,0.267,-0.3309,0.2513,-0.2332,0.1933,-0.271,0.1343,-0.332,0.2311,-0.0867,0.2368,-0.1383,0.3494,-0.4784,0.1017,-0.3446,0.272,-0.1594,0.0587,-0.3258,0.087,-0.3239,0.5254,-0.0797,0.2096,-0.1734,0.1569,-0.2469,0.2835,-0.1688,0.3415,-0.4962,0.119,-0.0866,0.2674,-0.3335,0.4633,-0.1245,0.1883,-0.2691,0.0082,-0.2368,0.066,-0.1721,0.0652,-0.1717,0.1942,-0.061,0.278,-0.2836,0.1308,-0.0981,0.0326,-0.1209,0.2181,-0.2917,0.2638,-0.1673,0.2631,-0.2205,0.1165,-0.0822,0.2984,-0.2844,0.3571,-0.1764,0.2889,-0.1183,0.0854,-0.2125,0.2568,-0.2561,0.3527,-0.4627,0.3475,-0.0148,0.4336,-0.229,0.2961,-0.3072,0.1188,-0.0525,0.198,-0.3725,0.1631,-0.0437,0.1749,-0.1601,0.2814,-0.1797,0.2032,-0.334,0.0921,-0.1683,0.0725,-0.1591,0.2392,-0.4001,0.2366,-0.376,0.1539,-0.1366,0.0626,-0.2924,0.1552,-0.0919,0.2836,-0.1126,0.3612,-0.1372,0.1012,-0.1211,0.3438,-0.1469,0.0836,-0.2224,0.4243,-0.3174,0.1496,-0.052,0.3117,-0.0945,0.3957,-0.0573,0.1579,-0.3501,0.256,-0.3065,0.2624,-0.2237,0.0562,-0.2848,0.2009,-0.0657,0.6987,-0.2803,0.229,-0.2511,0.232,-0.1905,0.3097,-0.4265,0.1199,-0.2407,0.0782,-0.1737,0.305,-0.3405,0.1579,-0.1393,0.125,-0.118,0.2716,-0.2998,0.087,-0.3306,0.119,-0.2109,0.0222,-0.3708,0.1679,-0.3943,0.1053,-0.381,0.3336,-0.1191,0.1124,-0.2274,0.1247,-0.2331,0.2384,-0.1601,0.0763,-0.3199,0.1752,-0.1019,0.1159,-0.1537,0.138,-0.1787,0.0101,-0.2223,0.2629,-0.1207,0.1525,-0.1115,0.2771,-0.0071,0.4404,-0.3481,0.3175,-0.3701,0.1087,-0.2781,0.1968,-0.1574,0.206,-0.2404,0.2541,-0.147,0.3267,-0.2834,0.1732,-0.1902,0.285,-0.2297,0.7397,-0.1234,0.0991,-0.2126,0.1749,-0.3843,0.3903,-0.3862,0.1333,-0.1912,0.3474,-0.2636,0.6307,-0.2393,0.3414,-0.2435,0.4059,-0.2831,0.4584,-0.2775,0.6608,-0.342,0.2067,-0.2979,0.7004,-0.0418,0.5095,-0.2684,0.247,-0.2627,0.118,-0.0845,0.3174,-0.2434,0.1774,-0.2711,0.0927,-0.1412,0.3984,-0.1957,0.3826,-0.2895,0.1676,-0.3549,0.3834,-0.1508,0.4384,-0.0124,0.205,-0.1017,0.021,-0.1474,0.1453,-0.1892,0.1194,-0.0995,0.3778,-0.1298,0.199,-0.0478,0.1487,-0.2887,0.4017,-0.3551,0.3762,-0.0818,0.2598,-0.2756,0.2831,-0.097,0.334,-0.2452,0.3966,-0.3263,0.2035,-0.3159,0.2506,-0.1566,0.2501,-0.3868,0.2595,-0.1718,0.0501,-0.0675,0.1659,-0.1845,0.1964,-0.2124,0.3122,-0.1423,0.1485,-0.068,0.4221,-0.3076,0.1809,-0.3127,0.3321,-0.1215,0.2047,-0.352,0.1415,-0.3188,0.335,-0.2993,0.3713,-0.1309,0.2917,-0.0657,0.2028,-0.3541,0.0445,-0.1745,0.0841,-0.1195,0.1086,-0.1855,0.1599,-0.1495,0.0645,-0.2057,0.0971,-0.2499,0.044,-0.3537,0.1569,-0.0535,0.2099,-0.0002,0.1589,-0.235,0.3293,-0.176,0.1599,-0.3708,0.2835,-0.355,0.1489,-0.1223,0.0988,-0.1612,0.1303,-0.1573,0.1131,-0.2797,0.1513,-0.1895,0.1035,-0.2253,0.0702,-0.1055,0.0625,-0.1622,0.1841,-0.1011,0.1971,-0.1575,0.1759,-0.082,0.3831,-0.3829,0.2141,-0.013,0.1307,-0.0474,0.215,-0.3479,0.1587,-0.1296,0.1222,-0.2685,0.1332,-0.2903,0.3239,-0.0294,0.1454,-0.3087,0.2625,-0.4131,0.0967,-0.1955,0.3252,-0.326,0.281,-0.3383,0.2542,-0.0224,0.364,-0.254,0.117,-0.3353,0.3024,-0.4716,0.1352,-0.2451,0.1772,-0.1711,0.23,-0.2644,0.0894,-0.2612,0.1093,-0.0766,0.298,-0.4779,0.2028,-0.044,0.0848,-0.0611,0.1643,-0.171,0.1777,-0.3326,0.1433,-0.2564,0.0241,-0.1909,0.0848,-0.3376,0.3748,-0.2807,0.1569,-0.2609,0.1953,-0.1331,0.2124,-0.0805,0.1832,-0.0285,0.1303,-0.015,0.1268,-0.1163,0.1418,-0.0444,0.1135,-0.1339,0.3354,-0.1044,0.292,-0.1073,0.2976,-0.1729,0.0826,-0.0807,0.0713,-0.1866,0.0466,-0.3154,0.086,-0.5074,0.2327,-0.1712,0.234,-0.1158,0.0588,-0.0551,0.1678,-0.1276,0.1984,-0.1406,0.0811,-0.2135,0.1509,-0.2911,0.097,-0.1838,0.2032,-0.2454,0.122,-0.1518,0.1187,-0.2174,0.1965,-0.0536,0.3839,-0.2726,0.1333,-0.212,0.0044,-0.0976,0.2127,-0.1149,0.0692,-0.1884,0.0021,-0.1845,0.4206,-0.2505,0.0712,-0.0383,0.3304,-0.3116,0.0679,-0.3647,0.0554,-0.2531,0.0366,-0.1867,0.2087,-0.2076,0.3025,-0.2244,0.2173,-0.2773,0.218,-0.0996,0.2975,-0.1398,0.2949,-0.0601,0.1234,-0.0579,0.1518,-0.0226,0.192,-0.1153,0.0738,-0.043,0.0841,-0.2332,0.1938,-0.2411,0.3949,-0.1852,0.3541,-0.2409,0.255,-0.3494,0.2506,-0.2339,0.2226,-0.226,0.2811,-0.2449,0.3312,-0.2074,0.0838,-0.1739,0.2622,-0.1466,0.0399,-0.1981,0.0001,-0.3437,0.1539,-0.0944,0.3893,-0.1089,0.0662,-0.0525,0.3287,-0.2967,0.0755,-0.3166,0.2397,-0.104,0.2018,-0.1904,0.5976,-0.1629,0.4635,-0.1459,0.2043,-0.1526,0.2515,-0.1849,0.1306,-0.2092,0.2931,-0.2225,0.2434,-0.0842,0.2079,-0.2153,0.1923,-0.2023,0.2234,-0.1605,0.1197,-0.1768,0.119,-0.1472,0.0702,-0.1701,0.1336,-0.1387,0.0051,-0.1796,0.2381,-0.2348,0.3264,-0.2484,0.2523,-0.274,0.5542,-0.1812,0.1744,-0.1256,0.2673,-0.1725,0.1257,-0.0721,0.4043,-0.192,0.1875,-0.0872,0.0622,-0.6783,0.0602,-0.3801,0.3691,-0.2242,0.3895,-0.0992,0.3769,-0.1682,0.3946,-0.3934,0.114,-0.1408,0.5969,-0.3108,0.2089,-0.13,0.4256,-0.0973,0.092,-0.2257,0.1202,-0.107,0.0297,-0.2763,0.0277,-0.353,0.0782,-0.3856,0.0091,-0.2174,0.2344,-0.2562,0.2488,-0.2943,0.625,-0.0894,0.1842,-0.0748,0.306,-0.2684,0.1467,-0.2083,0.2072,-0.4167,0.2427,-0.0834,0.1449,-0.1224,0.1055,-0.2695,0.3153,-0.3975,0.2158,-0.1135,0.3454,-0.0372,0.2252,-0.3355,0.6572,-0.2399,0.204,-0.2059,0.2141,-0.3415,0.3342,-0.1088,0.3794,-0.1513,0.3358,-0.1344,0.0645,-0.2507,0.3338,-0.2537,0.6428,-0.3075,0.2281,-0.2392,0.1324,-0.4243,0.3405,-0.1664,0.2843,-0.3091,0.3853,-0.3277,0.1967,-0.3708,0.2373,-0.2996,0.2105,-0.2795,0.3099,-0.2468,0.3999,-0.362,0.271,-0.2747,0.3006,-0.2745,0.0551,-0.4569,0.2357,-0.2687,0.0492,-0.2388,0.3421,-0.2159,0.1476,-0.3028,0.1883,-0.2049,0.0918,-0.2712,0.2719,-0.1613,0.187,-0.1961,0.341,-0.1652,0.1577,-0.1508,0.0934,-0.1819,0.2462,-0.3074,0.3703,-0.209,0.3034,-0.3138,0.0528,-0.1073,0.0425,-0.0717,0.1237,-0.0601,0.3422,-0.0645,0.3372,-0.2623,0.2015,-0.2122,0.2781,-0.2567,0.2963,-0.0683,0.1689,-0.4567,0.1257,-0.229,0.1758,-0.1311,0.2343,-0.0909,0.6183,-0.1369,0.227,-0.2589,0.1928,-0.2181,0.2451,-0.1992,0.1279,-0.2838,0.3691,-0.0964,0.3278,-0.2588,0.3848,-0.2256,0.3563,-0.2278,0.3095,-0.2151,0.3598,-0.3483,0.2686,-0.2364,0.3374,-0.1113,0.336,-0.3466,0.3737,-0.2275,0.376,-0.1379,0.2557,-0.4428,0.0416,-0.3184,0.1826,-0.1076,0.4782,-0.0839,0.1245,-0.2466,0.3308,-0.178,0.1606,-0.0605,0.2542,-0.1011,0.2355,-0.3433,0.1897,-0.0634,0.3694,-0.1187,0.2402,-0.245,0.0326,-0.2671,0.0566,-0.5346,0.4694,-0.4624,0.1224,-0.1731,0.3112,-0.1956,0.2193,-0.1445,0.1072,-0.1073,0.2141,-0.1466,0.1851,-0.3852,0.3442,-0.2657,0.1543,-0.2556,0.1388,-0.3556,0.2282,-0.3412,0.3755,-0.3344,0.3825,-0.1619,0.2842,-0.0611,0.2615,-0.1615,0.1352,-0.2543,0.2306,-0.2772,0.1542,-0.3022,0.2892,-0.1936,0.2523,-0.1508,0.4767,-0.2658,0.2489,-0.4164,0.0665,-0.2974,0.1309,-0.2119,0.1131,-0.2866,0.2498,-0.1922,0.2971,-0.2488,0.3998,-0.295,0.2702,-0.3081,0.1843,-0.1555,0.1332,-0.2293,0.3109,-0.1211,0.3154,-0.2994,0.2037,-0.2526,0.0551,-0.3198,0.106,-0.1642,0.0727,-0.1307,0.0992,-0.0361,0.4245,-0.1122,0.1762,-0.1712,0.2595,-0.1574,0.1816,-0.2578,0.2017,-0.3175,0.1375,-0.2677,0.0659,-0.1256,0.0816,-0.4218,0.131,-0.1378,0.1574,-0.2243,0.3016,-0.1225,0.1015,-0.1786,0.1864,-0.089,0.4952,-0.2851,0.0945,-0.2258,0.1794,-0.4559,0.3641,-0.177,0.3089,-0.1342,0.31,-0.2735,0.2678,-0.3641,0.216,-0.0926,0.1757,-0.2473,0.072,-0.2268,0.1555,-0.1346,0.1095,-0.1507,0.1329,-0.392,0.0998,-0.0331,0.2546,-0.0765,0.1451,-0.46,0.282,-0.102,0.2096,-0.1437,0.2286,-0.224,0.1975,-0.3705,0.2039,-0.0561,0.2273,-0.1003,0.4229,-0.2834,0.0956,-0.3293,0.1636,-0.2014,0.4639,-0.2531,0.0805,-0.1089,0.0248,-0.1964,0.1993,-0.206,0.0568,-0.2323,0.315,-0.3398,0.1849,-0.046,0.0972,-0.0912,0.0562,-0.1161,0.124,-0.2328,0.1429,-0.2256,0.117,-0.3386,0.1864,-0.1652,0.1797,-0.1883,0.0863,0,0.1808,-0.2085,0.1215,-0.2073,0.1019,-0.0792,0.0236,-0.097,0.0881,-0.1602,0.2839,-0.2678,0.1293,-0.1713,0.0725,-0.3002,0.0338,-0.2652,0.3013,-0.2049,0.1619,-0.2731,0.2893,-0.0911,0.2354,-0.1711,0.3827,-0.1395,0.2794,-0.2661,0.3293,-0.2057,0.3019,-0.4187,0.0308,-0.1622,0.3912,-0.4736,0.2218,-0.1001,0.3955,-0.1922,0.2326,-0.4298,0.1746,-0.2107,0.1814,-0.1393,0.208,-0.0567,0.1707,-0.1947,0.2096,-0.2535,0.1402,-0.1137,0.0913,-0.2562,0.1795,-0.3338,0.1369,-0.1061,0.0979,-0.0965,0.1079,-0.1842,0.1842,-0.162,0.1143,-0.196,0.2752,-0.0925,0.4272,-0.2282,0.2312,-0.0639,0.1149,-0.1464,0.109,-0.1619,0.2779,-0.1292,0.3398,-0.2402,0.0679,-0.1997,0.0694,-0.2648,0.1288,-0.1513,0.189,-0.1483,0.4029,-0.2997,0.2602,-0.2289,0.207,-0.2487,0.427,-0.435,0.389,-0.2243,0.1334,-0.2497,0.3185,-0.0496,0.358,-0.4974,0.498,-0.0471,0.3703,-0.1348,0.2733,-0.3568,0.2045,-0.4865,0.3312,-0.3819,0.2067,-0.2367,0.1672,-0.3605,0.1464,-0.3884,0.2738,-0.4034,0.2296,-0.1512,0.0396,-0.2647,0.2198,-0.169,0.1319,-0.2332,0.2576,-0.2663,0.5562,-0.2091,0.2577,-0.2963,0.2232,-0.2707,0.1733,-0.2292,0.1429,-0.3549,0.2423,-0.1104,0.1387,-0.3325,0.3022,-0.2274,0.2172,-0.175,0.1434,-0.1682,0.1692,-0.071,0.1328,-0.2111,0.0643,-0.2754,0.5258,-0.1575,0.4852,-0.1541,0.313,-0.2459,0.4886,-0.2187,0.0754,-0.3701,0.2655,-0.1565,0.041,-0.1664,0.5349,-0.5909,0.1497,-0.0212,0.2966,-0.0651,0.2471,-0.0665,0.3974,-0.3415,0.2065,-0.1261,0.133,-0.3809,0.3426,-0.1687,0.1225,-0.048,0.3591,-0.1599,0.1857,-0.1694,0.2625,-0.3159,0.4027,-0.1133,0.2698,-0.3362,0.4614,-0.2098,0.2364,-0.0726,0.1042,-0.2466,0.1191,-0.0839,0.2307,-0.3055,0.2016,-0.224,0.141,-0.2137,0.2488,-0.3469,0,-0.2287,0.2083,-0.4801,0.3398,-0.0485,0.2075,-0.2093,0.3498,-0.3784,0.2797,-0.0361,0.3064,-0.3243,0.3636,-0.1949,0.4672,-0.4253,0.2494,-0.0711,0.3042,-0.5571,0.0255,-0.4525,0.1877,-0.4172,0.3622,-0.4355,0.2205,-0.0318,0.2394,-0.1803,0.2823,-0.1164,0.1512,-0.2227,0.28,-0.2417,0.1067,-0.557,0.2733,-0.0237,0.0406,-0.0652,0.2096,-0.2525,0.2119,-0.0322,0.0237,-0.2956,0.2851,-0.2344,0.1383,-0.2836,0.2026,-0.1573,0.2378,-0.1117,0.0538,-0.2036,0.3198,-0.0533,0.3028,-0.0558,0.2694,-0.1412,0.3512,-0.284,0.2948,-0.4945,0.3667,-0.3219,0.0235,-0.4018,0.243,-0.2682,0.2271,-0.4117,0.3357,-0.1666,0.1648,-0.4058,0.3856,-0.0067,0.2359,-0.1968,0.1251,-0.0646,0.3325,-0.7151,0.2357,-0.1419,0.1753,-0.2318,0.1885,-0.1079,0.3739,-0.1588,0.3813,-0.3215,0.1784,-0.1122,0.1433,-0.1552,0.2383,-0.076,0.4712,-0.2082,0.1196,-0.4181,0.2104,-0.4121,0.4841,-0.6076,0.3413,-0.1292,0.2759,-0.2298,0.2161,-0.1756,0.3144,-0.0432,0.0719,-0.5757,0.0316,-0.2914,0.1798,-0.0459,0.3196,-0.3063,0.0956,-0.3181,0.3045,-0.3186,0.2978,-0.109,0.3831,-0.0224,0.2984,-0.2038,0.3309,-0.243,0.3562,-0.2922,0.3676,-0.3087,0.3157,-0.3743,0.265,-0.2258,0.0999,-0.2371,0.2236,-0.0574,0.2416,-0.1817,0.4072,-0.2827,0.513,-0.3682,0.283,-0.1711,0.3124,-0.1193,0.2258,-0.3246,0.3513,-0.3696,0.2257,-0.2321,0.1441,-0.1079,0.3958,-0.0906,0.3487,-0.2441,0.3071,-0.429,0.25,-0.4376,0.614,-0.3902,0.5385,-0.0894,0.2346,-0.3776,0.4448,-0.1299,0.0229,-0.5036,0.2251,-0.2624,0.3528,-0.1859,0.1688,-0.1284,0.118,-0.2228,0.2776,-0.1099,0.0746,-0.217,0.0395,-0.141,0.2163,-0.0842,0.1508,-0.092,0.2865,-0.1173,0.1643,-0.1327,0.1498,-0.0893,0.2399,-0.1284,0.1226,-0.1334,0.0475,-0.1366,0.1576,-0.2083,0.1277,-0.2018,0.192,-0.2162,0.123,-0.2458,0.1157,-0.2601,0.4234,-0.119,0.0727,-0.1665,0.1483,-0.1365,0.3129,-0.3611,0.1165,-0.1952,0.2907,-0.0814,0.1193,-0.1845,0.5268,-0.1622,0.1427,-0.1471,0.5955,-0.2337,0.0976,-0.4584,0.1716,-0.0723,0.0626,-0.281,0.2433,-0.231,0.1257,-0.0022,0.0786,-0.1554,0.1101,-0.1881,0.2999,-0.1222,0.2638,-0.2502,0.2799,-0.0682,0.1257,-0.1139,0.0794,-0.2894,0.2197,-0.2334,0.1407,-0.258,0.6055,-0.2389,0.0931,-0.1348,0.0271,-0.296,0.036,-0.082,0.1176,-0.0488,0.3474,-0.1696,0.0745,-0.3802,0.0784,-0.4299,0.3152,-0.0963,0.2659,-0.4713,0.1422,-0.1895,0.171,-0.0311,0.1944,-0.3056,0.1108,-0.3175,0.0746,-0.1443,0.1588,-0.1434,0.2657,-0.1405,0.2082,-0.3124,0.3634,-0.1522,0.2449,-0.3589,0.2533,-0.1774,0.3107,-0.2672,0.2936,-0.1432,0.2243,-0.4054,0.2992,-0.2734,0.4896,-0.1641,0.2074,-0.1843,0.4263,-0.2279,0.1526,-0.2289,0.3283,-0.2787,0.2538,-0.313,0.4639,-0.2418,0.1558,-0.162,0.2774,-0.1082,0.139,-0.0646,0.1219,-0.1867,0.1271,-0.2555,0.3572,-0.2702,0.2947,-0.3701,0.2687,-0.214,0.2848,-0.2323,0.2545,-0.117,0.1718,-0.2602,0.3487,-0.4128,0.2738,-0.4033,0.277,-0.3013,0.3521,-0.4871,0.125,-0.4024,0.1617,-0.0923,0.3099,-0.2813,0.3013,-0.211,0.4503,-0.1281,0.2614,-0.1696,0.3593,-0.4372,0.4273,-0.2234,0.0992,-0.2249,0.4022,-0.3125,0.1394,-0.2595,0.2251,-0.1933,0.319,-0.1692,0.2475,-0.3333,0.1313,-0.1457,0.4367,-0.0304,0.3363,-0.106,0.4555,-0.2397,0.2397,-0.1426,0.4028,-0.051,0.1047,-0.3273,0.1119,-0.08,0.2473,-0.1689,0.2012,-0.1087,0.1892,-0.2095,0.0509,-0.134,0.1008,-0.0758,0.2167,-0.1841,0.0667,-0.2485,0.2309,-0.2404,0.0888,-0.3232,0.2714,-0.2815,0.1617,-0.2137,0.1764,-0.2645,0.3449,-0.3561,0.2406,-0.4396,0.2026,-0.4263,0.2826,-0.1699,0.2561,-0.1184,0.2532,-0.2758,0.0013,-0.0012,0.0002,-0.0001]

let wavesurfer = {};

function Waveform({ episodeForm }) {
  const waveformRef = useRef();
  const sliderRef = useRef();
  const timelineRef = useRef();
  const rowInputRef = useRef();

  const [zoomValue, setZoomValue] = useState(1);
  const [loadingValue, setloadingValue] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [region, setRegion] = useState([]);
  const [trigger] = useState(Math.random());
  const [source, setSource] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [fetch, setFetch] = useState(false);
  const [decode, setDecode] = useState(true);
  const [isError, setIsError] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);
  const [isInfoRed, setIsInfoRed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [validFile, setValidFile] = useState(false);
  const incr = useRef(0);
  const mappedRegions = useRef([]);
  const isErrorMessage = useRef(false);

  const episodeSource = `${episodeForm.assetsFilePath}`;
  const configRegion = ({ id = '', start = '', end = '' }) => ({
    id,
    start,
    end,
    color: '#89C42C',
    style: ''
  });

  const cursorStyle = {
    'background-color': '#666F77',
    color: '#fff',
    padding: '2px',
    'font-size': '10px'
  };

  function getCurrentCursorTime(instance, pos) {
    const duration = instance.getDuration();
    const elementWidth = instance.drawer.width / instance.params.pixelRatio;
    const scrollWidth = instance.drawer.getScrollX();

    const scrollTime = (duration / instance.drawer.width) * scrollWidth;

    return Math.max(0, (pos / elementWidth) * duration) + scrollTime;
  }

  // set source of episode
  useEffect(() => {
    setSource(episodeSource);
  }, [episodeForm]);

  // In case component is unmounted while file is playing, stop the audio file
  useEffect(() => {
    return () => {
      if (wavesurfer) {
        wavesurfer.stop();
      }
    };
  }, []);

  // init waveform
  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        barWidth: 3,
        cursorWidth: 0.2,
        progressColor: '#BEDE8B',
        waveColor: '#ECEBEB',
        height: 100,
        responsive: true,
        plugins: [
          CursorPlugin.create({
            showTime: true,
            opacity: 0.9,
            customShowTimeStyle: cursorStyle
          }),
          TimelinePlugin.create({
            container: timelineRef.current
          }),
          RegionPlugin.create({
            resizable: false
          })
        ]
      });

      wavesurfer.on('loading', x => {
        setloadingValue(x);
        if (x >= 100) {
          setStatusLoading(true);
          console.time('decoding');
        }
      });

      wavesurfer.on('ready', () => {
        console.timeEnd('decoding');
        setDecode(false);
        setMaxValue(wavesurfer.getDuration());
      });

      // When file finish playing - go to start and stop
      wavesurfer.on('finish', () => {
        wavesurfer.stop();
        setPlaying(false);
      });
    }
  }, []);

  useEffect(() => {
    if (source) {
      wavesurfer.load(source);
    }
  }, [source]);

  // get triggers from api
  useEffect(() => {
    wavesurfer.on('ready', () => {
      if (wavesurfer.getDuration() < 240) {
        setInfoMessage(
          'Your episode duration must be at least 240 seconds to set triggers.'
        );
      } else {
        setValidFile(true);
      }

      function fetchData() {
        return new Promise((resolve, reject) => {
          setFetch(true);
          return HTTP.get(`Waveform/${episodeForm.uid}`)
            .then(response => {
              if (response) {
                setFetch(false);
                const triggers = response.data.dataItem;

                const tempTriggers = [];

                // build a temporary array with base properties
                triggers.map(t => {
                  tempTriggers.push({
                    id: t.id,
                    start: t.startDelay,
                    end: t.startDelay + 0.2
                  });
                });

                // construct final objects of triggers with good properties
                tempTriggers.forEach(each => {
                  wavesurfer.addRegion(
                    configRegion({
                      id: each.id,
                      start: each.start,
                      end: each.end
                    })
                  );

                  // Construct triggers inital value
                  mappedRegions.current.push({
                    id: each.id,
                    start: each.start,
                    end: each.end
                  });
                });

                // store config
                setRegion([...Object.values(wavesurfer.regions.list)]);
                resolve(response);
              }
            })
            .catch(error => {
              setFetch(false);
              reject(error);
            });
        });
      }

      fetchData();
    });
  }, [trigger]);

  const removeErrorMessage = () => {
    setTimeout(() => {
      setErrorMessage(null);
      isErrorMessage.current = false;
    }, 2000);
  };

  const handleErrorMessage = message => {
    if (!isErrorMessage.current) {
      isErrorMessage.current = true;
      setErrorMessage(message);
      removeErrorMessage();
    }
  };

  useEffect(() => {
    if (wavesurfer) {
      // wavesurfer.on('region-updated', ({id, start}) => {
      //   console.log(`id: ${id}, start: ${+start}`);
      // });

      wavesurfer.on('region-update-end', ({ id, start }) => {
        removeAllWaveRegionStyle('.row');
        const currentRow = document.getElementById(`row_${id}`);
        currentRow.classList.add('current');

        const currentInitialRegionValue = mappedRegions.current.find(
          el => el.id === id
        );

        const fileDuration = wavesurfer.getDuration();
        const currentTriggers = wavesurfer.regions.list;
        const currentRegionsKeys = Object.keys(currentTriggers);

        if (start < 120) {
          handleErrorMessage('Trigger must be added 120 sec after the start');
          wavesurfer.regions.list[id].update({
            start: currentInitialRegionValue.start,
            end: currentInitialRegionValue.end
          });
          return;
        }

        if (fileDuration - start < 60) {
          handleErrorMessage(
            'Trigger must be added at least 60 seconds before the end'
          );
          wavesurfer.regions.list[id].update({
            start: currentInitialRegionValue.start,
            end: currentInitialRegionValue.end
          });
          return;
        }

        // Prevent triggers from being placed t close to each others (120 seconds interval min)
        const newList = currentRegionsKeys
          .map(key => {
            return currentTriggers[key];
          })
          .filter(el => {
            return el.id !== id;
          });

        const canAddTrigger = newList.every(region => {
          return region.start <= start - 120 || region.start >= start + 120;
        });

        if (!canAddTrigger) {
          handleErrorMessage(
            'Triggers must be separated of at least 120 seconds'
          );
          wavesurfer.regions.list[id].update({
            start: currentInitialRegionValue.start,
            end: currentInitialRegionValue.end
          });
          return;
        }

        // update current selected trigger

        wavesurfer.regions.list[id].update({
          start,
          end: +start + 0.2
        });

        currentInitialRegionValue.start = start;
        currentInitialRegionValue.end = +start + 0.2;

        setRegion([...Object.values(wavesurfer.regions.list)]);
      });
    }
    // IMPORTANT: Keep "source" as useEffect trigger condition
  }, [source]);

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.on('error', e => {
        if (e) {
          setIsError(true);
        }
      });
    }
  }, [source]);

  const updateRegion = useCallback(() => {
    incr.current++;
    setRegion([...Object.values(wavesurfer.regions.list)]);
  }, [incr.current]);

  const rightClick = e => {
    e.preventDefault();
    const positionCursor = wavesurfer.cursor.cursor.style.left;
    const cleanPosition = positionCursor.replace('px', '');

    // get position of tooltip generated by Cursor and convert it
    const currentTime = getCurrentCursorTime(wavesurfer, +cleanPosition);
    const fileDuration = wavesurfer.getDuration();

    // move cursor to new position
    wavesurfer.seekTo(currentTime / fileDuration);

    // If duration is smaller or equal to 240 seconds, not possible to add triggers
    if (fileDuration <= 240) {
      setIsInfoRed(true);
      setTimeout(() => {
        setIsInfoRed(false);
      }, 2000);
      return;
    }
    // Check if trigger start is greater than 120
    if (currentTime < 120) {
      handleErrorMessage('Trigger must be added 120 sec after the start');
      return;
    }

    // Check if trigger is 60 seconds before end
    if (fileDuration - currentTime < 60) {
      handleErrorMessage(
        'Trigger must be added at least 60 seconds before the end'
      );
      return;
    }

    // Check if interval between triggers is at least 120
    const currentTriggers = wavesurfer.regions.list;
    const currentRegionsKeys = Object.keys(currentTriggers);

    const canAddTrigger = currentRegionsKeys.every(key => {
      return (
        currentTriggers[key].start <= currentTime - 120 ||
        currentTriggers[key].start >= currentTime + 120
      );
    });

    if (!canAddTrigger) {
      handleErrorMessage('Triggers must be separated of at least 120 seconds');
      return;
    }
    // Reset infoMessage

    // add region to waveform
    wavesurfer.addRegion(
      configRegion({
        id: incr.current,
        start: currentTime,
        end: currentTime + 0.2
      })
    );

    mappedRegions.current.push({
      id: incr.current,
      start: currentTime,
      end: currentTime + 0.2
    });

    updateRegion();
  };

  // use this counter to re-trigger use effect on each click.
  // btw, we also can use it to set an id to each trigger on the wave (region)
  useEffect(() => {
    if (!isError && waveformRef.current) {
      waveformRef.current.addEventListener('contextmenu', rightClick, false);

      return () => {
        // eslint-disable-next-line no-unused-expressions
        waveformRef.current &&
          waveformRef.current.removeEventListener(
            'contextmenu',
            rightClick,
            false
          );
      };
    }
  }, []);

  // control (play, pause) methods
  const playFiles = useCallback(status => {
    wavesurfer.playPause();
    setPlaying(status);
  }, []);

  // bind key to play/pause
  useEffect(() => {
    function processKey(e) {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        playFiles();
        setPlaying(playing => !playing);
      }
    }

    window.addEventListener('keydown', processKey, false);
    return () => {
      window.removeEventListener('keydown', processKey, false);
    };
  }, [playing]);

  // save triggers
  const saveTriggers = useCallback(async () => {
    // prepare object of region to send
    const regionToSend = [];
    region.map(region => regionToSend.push(region.start));

    try {
      setFetch(true);
      await HTTP.post('Waveform', {
        episodeUID: episodeForm.uid,
        times: [...regionToSend]
      });
      setFetch(false);
    } catch (e) {
      setFetch(false);
    }
  });

  const handleZoom = useCallback(e => {
    setZoomValue(+e.target.value);
    // bind zoom with range slider
    wavesurfer.zoom(+e.target.value);
  }, []);

  // update one region and set value on the new state
  const handleStoredValue = (value, id) => {
    const currentTime = +value;
    const currentTriggers = wavesurfer.regions.list;
    const currentRegionsKeys = Object.keys(currentTriggers);
    const totalDuration = wavesurfer.getDuration();

    const currentInitialRegionValue = mappedRegions.current.find(
      region => region.id.toString() === id.toString()
    );

    // Prevent trigger from being placed in the first 120 seconds
    if (currentTime < 120) {
      return handleErrorMessage(
        'Trigger must be added 120 seconds after the start'
      );
    }

    // Prevent trigger from being placed in the last 60 seconds
    if (totalDuration - currentTime < 60) {
      return handleErrorMessage(
        'Trigger must be added at least 60 seconds before the end'
      );
    }

    // Prevent triggers from being placed to close to each others (120 seconds interval min)
    const newList = currentRegionsKeys
      .map(key => {
        return currentTriggers[key];
      })
      .filter(el => {
        return el.id.toString() !== id.toString();
      });

    const canAddTrigger = newList.every(region => {
      return (
        region.start <= currentTime - 120 || region.start >= currentTime + 120
      );
    });

    if (!canAddTrigger) {
      return handleErrorMessage(
        'Triggers must be separated of at least 120 seconds'
      );
    }

    setErrorMessage(null);
    wavesurfer.regions.list[id].update({
      start: +value,
      end: +value + 0.2
    });

    currentInitialRegionValue.start = +value;
    currentInitialRegionValue.end = +value + 0.2;
    setRegion([...Object.values(wavesurfer.regions.list)]);
  };

  const removeAllWaveRegionStyle = element => {
    const allMarker = document.querySelectorAll(element);
    allMarker.forEach(e => {
      if (e.classList.contains('current')) {
        e.classList.remove('current');
      }
    });
  };

  // Handle the arrows click on trigger's row
  const handleArrowChange = (action, incrementValue, currentValue, id) => {
    // Calcul example if:
    // action = increment, incrementValue = 60 (minutes input, so increment by 60 seconds), currentValue = 04
    // newValue (int: 4) += 60
    // '+' is added to remove leading 0 (e.g: value = 04, turns it into: 4 and convert it into a number)
    let newValue = +currentValue;
    if (action === 'increment') {
      newValue += incrementValue;
    } else if (action === 'decrement') {
      newValue -= incrementValue;
    }
    handleStoredValue(newValue, id);
  };

  // Handle the trigger's row input change
  const handleInputChange = (
    e,
    initialInputValue,
    initialValue,
    incrementValue
  ) => {
    const { value, id } = e.target;
    // '+' is added to remove leading 0 (e.g: value = 04, turns it into: 4 and convert it into a number)
    // Calcul example if:
    // initialInput value = 04 (minutes row), initialValue = 275 (seconds), incrementValue = 60, value = 06
    // diff = -4 + 6 = 2 (two minutes should be added to the inital value 4)
    // newValue = 275 + (2 * 60)
    const diff = -+initialInputValue + +value;
    const newValue = +initialValue + diff * incrementValue;
    handleStoredValue(newValue, id);
  };

  const setCurrentMarker = id => {
    const nodeList = document.querySelectorAll('.wavesurfer-region');
    Array.from(nodeList).find(elem => {
      if (+elem.dataset.id === +id) {
        elem.classList.add('current');
      }
    });
  };

  const handleFocus = (e, i) => {
    // clean active region
    removeAllWaveRegionStyle('.wavesurfer-region');

    // set current region
    setCurrentMarker(i);
  };

  // const handleBlur = () => {
  //   // clean active region when focus out
  //   removeAllWaveRegionStyle('.wavesurfer-region');
  // };

  const handleMouseEnter = ({ currentTarget }, i) => {
    currentTarget.classList.add('current');
    setCurrentMarker(i);
  };

  const handleMouseLeave = ({ currentTarget }, i) => {
    currentTarget.classList.remove('current');
    removeAllWaveRegionStyle('.wavesurfer-region');
  };

  // const handleKeyUp = e => {
  //   if (e.target.value > maxValue) {
  //     e.target.value = maxValue;
  //   }
  // };

  const deleteRegion = id => {
    wavesurfer.regions.list[id].remove();
    setRegion([...Object.values(wavesurfer.regions.list)]);

    mappedRegions.current = mappedRegions.current.filter(
      region => region.id !== id
    );
  };

  const sortedRegion = data => {
    return data.sort((a, b) => a.start - b.start);
  };

  // Triggered when click on a row
  // Place the current position at the trigger time
  const updateCurrentPosition = current => {
    const sec = wavesurfer.getDuration();
    wavesurfer.seekTo(current / sec);
  };

  return (
    <>
      {isError ? (
        <LoadingError>Error with remote file</LoadingError>
      ) : (
        <div>
          <Root>
            {isError && <Loader>Error with remote file</Loader>}
            {loadingValue < 100 && !isError && (
              <Loader>Download file {loadingValue} %</Loader>
            )}

            <Control>
              {!decode && !playing ? (
                <Play
                  width="30px"
                  height="30px"
                  // ref={playRef}
                  onClick={() => {
                    playFiles(true);
                    // setPlaying(true)
                  }}
                />
              ) : (
                !decode && (
                  <Pause
                    width="30px"
                    height="30px"
                    // ref={playRef}
                    onClick={() => {
                      playFiles(false);
                      // setPlaying(false)
                    }}
                  />
                )
              )}
            </Control>

            <WaveForm ref={waveformRef} />
            {statusLoading && decode && !isError && (
              <Decoding>Decoding file </Decoding>
            )}
          </Root>

          <TimelineContainer ref={timelineRef} />
          {!decode && (
            <div className="slider-container">
              <Slider style={{ width: '50%' }}>
                <input
                  ref={sliderRef}
                  onChange={e => handleZoom(e)}
                  type="range"
                  min="1"
                  max="200"
                  value={zoomValue}
                />
              </Slider>
              {validFile && (
                <Flex justifyContent="flex-end" style={{ width: '50%' }}>
                  <Box pt={30}>
                    <LoadingButton
                      onClick={() => saveTriggers()}
                      isLoading={fetch}
                      withComponent={<BigGradientPillButton />}
                    >
                      Save triggers
                    </LoadingButton>
                  </Box>
                </Flex>
              )}
            </div>
          )}

          <h4>Monetize your episode</h4>
          {infoMessage && (
            <StyledInfoText isRed={isInfoRed}>{infoMessage}</StyledInfoText>
          )}
          <Text style={{ marginBottom: '8px' }}>
            Left click to position on the wave form, Right click to add trigger
            on the position.
          </Text>
          <ErrorMessageContainer>
            {errorMessage && (
              <StyledInfoTextRed>{errorMessage}</StyledInfoTextRed>
            )}
          </ErrorMessageContainer>

          <div className="root-input">
            {sortedRegion(region).map((r, i) => (
              <div
                className="row"
                ref={rowInputRef}
                id={`row_${r.id}`}
                onMouseEnter={e => handleMouseEnter(e, r.id)}
                onMouseLeave={e => handleMouseLeave(e, r.id)}
                key={r.id}
                onClick={() =>
                  updateCurrentPosition(Number(r.start.toFixed(2)))
                }
              >
                <span className="delete" onClick={() => deleteRegion(r.id)}>
                  X
                </span>
                <span className="label">Trigger ads added at </span>

                <TimeInput
                  id={r.id}
                  value={r.start.toFixed(2)}
                  incrementValue={3600}
                  index="0"
                  handleArrowChange={handleArrowChange}
                  handleChange={handleInputChange}
                  name="hours"
                  label="h :"
                  onFocus={e => handleFocus(e, r.id)}
                />

                <TimeInput
                  id={r.id}
                  value={r.start.toFixed(2)}
                  incrementValue={60}
                  index="1"
                  handleArrowChange={handleArrowChange}
                  handleChange={handleInputChange}
                  name="minutes"
                  label="m :"
                  onFocus={e => handleFocus(e, r.id)}
                />

                <TimeInput
                  id={r.id}
                  value={r.start.toFixed(2)}
                  incrementValue={1}
                  index="2"
                  handleArrowChange={handleArrowChange}
                  handleChange={handleInputChange}
                  name="seconds"
                  label="s"
                  onFocus={e => handleFocus(e, r.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Waveform;
