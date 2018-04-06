module.exports = function() {

    let data = {}

    function dump() {
        return data
    }

    function profile(fn, label = fn.name) {

        return function(...args) {
            const startedAt = new Date()
            const result = fn.apply(null, args)

            const track = e => {
                incrementTimes(label)
                trackExecutionTime(label, startedAt)
                return e
            }

            if (isPromise(result)) {
                result.then(track).catch(track)
            } else {
                track()
            }

            return result
        }

    }

    function incrementTimes(label) {
        const item = getDataItem(label)
        if (!item.times) { item.times = 0 }

        item.times++
    }


    function trackExecutionTime(label, startedAt) {
        const item = getDataItem(label),
            elapsed = new Date().getTime() - startedAt.getTime()

        if (typeof item.slower === 'undefined' || item.slower < elapsed) {
            item.slower = elapsed
        }

        if (typeof item.faster === 'undefined' || item.faster > elapsed) {
            item.faster = elapsed
        }

        if (typeof item.avg === 'undefined') {
            item.avg = elapsed
        } else {
            let { times, avg } = item
            item.avg = avg * (times - 1) / times + elapsed / times
        }

    }

    function isPromise(p) {
        const { then } = p || {}
        return typeof then !== 'undefined' && typeof then === 'function'
    }

    function getDataItem(label) {
        if (!data[label]) { data[label] = {} }
        return data[label]
    }

    function count(label, n = 1) {
        const item = getDataItem(label)
        if (!item.count) { item.count = 0 }

        item.count += n
    }

    return {
        profile,
        dump,
        count
    }


}