import datetime


def check_time(time_start, time_end):
    now = int(datetime.datetime.now().timestamp())
    if(time_start == None and time_end == None):
        return 10000, now
    elif(time_start != None and int(time_start) < 0):
        return None, None
    elif(time_end != None and int(time_end) > now + 100):
        return None, None
    elif(time_start != None and (time_end == None or time_end == 0)):
        return max(time_start, 10000), now
    elif((time_start == None or time_start == 0) and time_end != None):
        return 10000, max(time_end, 10000)
    return time_start, time_end


def get_time_arguments(parser):
    parser.add_argument('time_start', type=int)
    parser.add_argument('time_end', type=int)
    args = parser.parse_args()
    return check_time(args['time_start'], args['time_end'])
