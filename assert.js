
module.exports = {
    assert
}

function assert(expectation, message) {
    const result = typeof expectation === 'function'
        ? expectation()
        : expectation;
    if (!result) {
        throw new Error(
            (
                typeof message === 'function'
                    ? message()
                    : message
            ) || 'assert failed'
        );
    }
}