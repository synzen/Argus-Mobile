export default {
    parseDateString: str => {
        // This is in the format of 2018-12-16 16:44:07
        const data = str.split(' ')
        const date = data[0].split('-')
        const time = data[1].split(':')
        // The month must be subtracted by 1 since they count from 0
        return new Date(date[0], parseInt(date[1], 10) - 1, date[2], time[0], time[1], time[2])
    }
}