// © 2021 Alexx Sub, https://github.com/alexxsub/
module.exports = {
  Query: {

    getData2: async (_, args, { User, currentUser }) => {
      return null
    },
    getData: async (_, args, { User, currentUser }) => {
      // fill demo data
      var data = [],
        r = []
      for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 3; j++) {
          r[j] = Math.floor(Math.random() * 100)
        }

        data.push({ name: `line ${i}`, admin: r[0], director: r[1], manager: r[2] })
      }
      // find roles of current user
      const roles = await User.findOne({ _id: currentUser._id })
        .then(res => res.roles)
      // return data by roles
      return data.map(el => {
        if (!roles.includes('admin')) el.admin = '*'
        if (!roles.includes('manager')) el.manager = '*'
        if (!roles.includes('director')) el.director = '*'
        return el
      })
    }
  },
  Mutation: {
    add: async (_, args, { Data, User, currentUser }) => {
      return null
    },
    clear: async (_, args, { Data, User, currentUser }) => {
      const res = await Data.remove()
      return res
    }
  }
}
