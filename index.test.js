const chai = require('chai')
const spies = require('chai-spies-next')
chai.use(spies)
var dirtyChai = require('dirty-chai');
chai.use(dirtyChai)
const expect = chai.expect;


const createModule = () => {
    let factory = require(__dirname + '/index')
    return factory()
}


describe('Test Utils.Profiler', function() {


    describe('creation', function() {

        it('should not throw on creation', function() {
            expect(createModule).not.to.throw()
        });

    });


    describe('profile()', function() {

        it('should expose a "profile" method', function() {
            let module = createModule()
            expect(typeof module.profile).to.equal('function')
        })

        it('should execute the given function', function() {

            const spied = chai.spy(),
                arg1 = 'fake arg 1',
                arg2 = 'fake arg 2'

            const profiled = createModule().profile(spied)
            profiled(arg1, arg2)

            expect(spied).to.have.been.called(1)
            expect(spied).to.have.been.called.with(arg1, arg2)
        });

        it('should return the same function', function() {

            const mock_result = 'mocke',
                spied = chai.spy.returns(mock_result)

            const profiled = createModule().profile(spied)
            const result = profiled()

            expect(result).to.equal(mock_result)

        });

        it('should resolve with same value if is a Promise', function(done) {

            const mock_result = 'mocke',
                fn = () => Promise.resolve(mock_result),
                spied = chai.spy()

            const profiled = createModule().profile(fn)
            const result = profiled()

            result
                .then(spied)
                .then(_ => {
                expect(spied).to.have.been.called.with(mock_result)
            done()
        })

        });

        it('should reject with same value if is a Promise', function(done) {

            const mock_result = 'mocke',
                fn = () => Promise.reject(mock_result),
                spied = chai.spy()

            const profiled = createModule().profile(fn)
            const result = profiled()

            result
                .catch(spied)
                .then(_ => {
                expect(spied).to.have.been.called.with(mock_result)
            done()
        })

        });


    })

    describe('dump()', function() {
        it('should expose a "dump" method', function() {
            let module = createModule()
            expect(typeof module.dump).to.equal('function')
        })

        it('should return correct result (no profiling)', function() {

            const expected = {}

            const result = createModule().dump()

            expect(result).to.deep.equal(expected)

        });

        it('should return correct result (single scalar function)', function() {

            const label = 'my func',
                profiler = createModule(),
                fn = () => {}


            const profiled = profiler.profile(fn, label)

            for (var i = 0; i < 3; i++) {
                profiled()
                let result = profiler.dump()
                expect(result[label]).not.to.be.undefined()
                expect(result[label].times).to.equal(i + 1)
                expect(result[label].slower).not.to.be.undefined()
                expect(result[label].faster).not.to.be.undefined()
                expect(result[label].avg).not.to.be.undefined()
            }
        });

        it('should return correct result (multiple scalar function)', function() {

            const profiler = createModule(),
                fns = [
                    { label: 'fn1', fn: _ => {}, times: 3 },
            { label: 'fn2', fn: _ => {}, times: 5 },
            { label: 'fn3', fn: _ => {}, times: 8 }
        ]

            for (let i = fns.length - 1; i >= 0; i--) {
                let { label, fn, times } = fns[i],
                    profiled = profiler.profile(fn, label)

                for (let i = times - 1; i >= 0; i--) {
                    profiled()
                }

            }

            const dump = profiler.dump()

            for (let i = fns.length - 1; i >= 0; i--) {
                let { label, times } = fns[i]
                expect(dump[label]).not.to.be.undefined()
                expect(dump[label].times).to.equal(times)
            }
        });

        it('should return correct result (single promise function)', function(done) {

            const label = 'my func',
                profiler = createModule(),
                fn = () => Promise.resolve('ok')


            const profiled = profiler.profile(fn, label)

            profiled()
                .then(e => {
                let result = profiler.dump()
                expect(result[label]).not.to.be.undefined()
            expect(result[label].times).to.equal(1)
            expect(result[label].slower).not.to.be.undefined()
            expect(result[label].faster).not.to.be.undefined()
            expect(result[label].avg).not.to.be.undefined()
            done()
        })


        });

    });

    describe('count()', function() {

        it('should expose a "count" method', function() {
            let module = createModule()
            expect(typeof module.count).to.equal('function')
        })

        it('should count single event', function() {
            const module = createModule(),
                label = 'my label',
                times = 3

            for (var i = times - 1; i >= 0; i--) {
                module.count(label)
            }

            const dump = module.dump()

            expect(dump[label]).not.to.be.undefined()
            expect(dump[label].count).to.equal(times)


        });

        it('should count sum value', function() {
            const module = createModule(),
                label = 'my label'

            let sum = 0

            for (var i = 5 - 1; i >= 0; i--) {
                sum += i
                module.count(label, i)
            }

            const dump = module.dump()

            expect(dump[label]).not.to.be.undefined()
            expect(dump[label].count).to.equal(sum)

        });
    });

});