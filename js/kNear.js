class kNear {
    constructor(k) {
        // Initialize the k-nearest neighbors classifier with a specified value of k
        this.k = k
        this.training = [] // Initialize an empty array to store training data
    }

    // Compute the Euclidean distance between two vectors
    // This function assumes that both vectors are arrays of equal length
    dist(v1, v2) {
        let sum = 0
        // Iterate through each element in the vectors
        v1.forEach((val, index) => {
            // Calculate the squared difference for each corresponding element
            sum += Math.pow(val - v2[index], 2)
        })
        // Return the square root of the sum of squared differences (Euclidean distance)
        return Math.sqrt(sum)
    }

    // Update the maximum distance found in an array of objects with distance properties
    updateMax(val, arr) {
        let max = 0
        // Iterate through each object in the array
        for(let obj of arr) {
            // Update max if the current object's distance is greater
            max = Math.max(max, obj.d)
        }
        return max
    }

    // Determine the mode (most frequent element) in an array
    mode(store) {
        let frequency = {} // Object to hold the frequency of each element
        let max = 0 // Variable to track the maximum frequency
        let result // Variable to hold the element with the maximum frequency
        // Iterate through each element in the array
        for (let v in store) {
            // Increment the frequency of the current element
            frequency[store[v]] = (frequency[store[v]] || 0) + 1
            // Update max and result if the current element's frequency is greater
            if (frequency[store[v]] > max) {
                max = frequency[store[v]]
                result = store[v]
            }
        }
        return result
    }

    // Add a point to the training set with its label
    learn(vector, label) {
        // Create an object representing the training point
        let obj = { v: vector, lab: label }
        // Add the object to the training array
        this.training.push(obj)
    }

    // Classify a new unknown point based on the training data
    classify(v) {
        let voteBloc = [] // Array to store the k nearest neighbors
        let maxD = 0 // Variable to track the maximum distance in voteBloc

        // Iterate through each training point
        for(let obj of this.training) {
            // Calculate the distance between the new point and the training point
            let o = { d: this.dist(v, obj.v), vote: obj.lab }
            // If voteBloc has fewer than k elements, add the new object
            if (voteBloc.length < this.k) {
                voteBloc.push(o)
                // Update the maximum distance in voteBloc
                maxD = this.updateMax(maxD, voteBloc)
            } else {
                // If voteBloc has k elements and the new object's distance is less than maxD
                if (o.d < maxD) {
                    let bool = true
                    let count = 0
                    // Iterate through voteBloc to replace the element with maxD
                    while (bool) {
                        if (Number(voteBloc[count].d) === maxD) {
                            // Replace the element with the new object
                            voteBloc.splice(count, 1, o)
                            // Update the maximum distance in voteBloc
                            maxD = this.updateMax(maxD, voteBloc)
                            bool = false
                        } else {
                            // Move to the next element in voteBloc
                            if (count < voteBloc.length - 1) {
                                count++
                            } else {
                                bool = false
                            }
                        }
                    }
                }
            }
        }

        let votes = [] // Array to hold the labels of the k nearest neighbors
        // Extract the labels from voteBloc
        for(let el of voteBloc) {
            votes.push(el.vote)
        }
        // Return the mode (most frequent label) of the k nearest neighbors
        return this.mode(votes)
    }
}
