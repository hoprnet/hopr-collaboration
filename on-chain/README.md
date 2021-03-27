# HOPR Collaboration

## HOPR net

HOPR is a privacy-preserving messaging protocol that incentivizes users to participate in the network. It provides privacy by relaying messages via several relay nodes to the recipient. Relay nodes are getting paid via payment channels for their services.

## Chain on a Chip

Chip records data e.g. 10s of data and calculates hash in an ongoing fashion in hardware and every now and then it outputs a hash and corresponding signature. The chip is chaining hashes by incorporating the previous hash into the following hash, similar to how a public blockchain works. This on-chip blockchain allows us to prove that no data has been recorded between two blocks and by providing a genesis hash that corresponds to a public blockchain hash, it provides evidence that the data could not have been provided before the block time of that hash.


### Installation

- Set node version
    ```
    nvm use
    ```
    
- Install packages 
    ```
    yarn
    ```

- Compile contracts
    ```
    yarn build
    ```
- Test contracts
    ```
    yarn test
    ```
- Test coverage
    ```
    yarn coverage
    ```

### Status

Current code coverage is 
```
-------------------|----------|----------|----------|----------|----------------|
File               |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------|----------|----------|----------|----------|----------------|
 contracts/        |    90.48 |       50 |      100 |     91.3 |                |
  ChainOnAChip.sol |    90.48 |       50 |      100 |     91.3 |         68,104 |
-------------------|----------|----------|----------|----------|----------------|
All files          |    90.48 |       50 |      100 |     91.3 |                |
-------------------|----------|----------|----------|----------|----------------|
```