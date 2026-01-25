                placeholder="Your Credit Repair Company"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Client Slots</span>
                <span className="font-medium">{selectedPlan?.clients}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="text-gray-600">Monthly Price</span>
                <span className="font-bold text-lg">${selectedPlan?.price}/mo</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade}
              disabled={!agencyName.trim() || upgradeToAgency.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {upgradeToAgency.isPending ? "Processing..." : "Upgrade Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
