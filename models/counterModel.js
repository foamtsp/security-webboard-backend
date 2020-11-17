const dotenv = require('dotenv');
dotenv.config({
  path: './config.env'
});

exports.getSequenceValue = async (mongo, sequenceName) => {
    try {
        const sequenceValue = await mongo
            .db(process.env.DATABASE_NAME)
            .collection('counters')
            .findOne({
                _id: sequenceName,
            });
        await mongo
            .db(process.env.DATABASE_NAME)
            .collection('counters')
            .updateOne({
                _id: sequenceName,
            }, {
                $inc: {
                    sequence_value: 1,
                },
            });

        return sequenceValue.sequence_value;
    } catch (err) {
        throw new Error(err.message);
    }
}